const db = require("../config/db");
const { sendSMS } = require("./smsServices")


exports.createPayment = async (req, res) => {
    const {
        client_id,
        bill_id,
        entity_type,
        entity_id,
        year,
        details,
        jcr_ref,
        payment_date,
        payment_type,
        amount
      } = req.body;
    try {
    
        const [result] = await db.query(
          `INSERT INTO payments (client_id, bill_id, entity_type, entity_id, year, details, jcr_ref, payment_date, payment_type, payment_status, amount, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [client_id, bill_id, entity_type, entity_id, year, details || null, jcr_ref || null, payment_date, payment_type, "Pending", amount]
        );
    
        const insertedId = result.insertId;
        res.status(201).json({success: true, message: 'Payment successfull', payment_id: insertedId });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Payment failed' });
      }
}

exports.getClientPaymentData = async (req, res) => {
    const client_id = req.query.client_id;
    try {
      const [clientRows] = await db.query(
        'SELECT * FROM clients WHERE client_id = ?',
        [client_id]
      );
  
      if (clientRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Client not found' });
      }
  
      const [businessRows] = await db.query(
        `SELECT businesses.business_name,businesses.business_id, bills.*, DATE_FORMAT(bills.due_date, '%d-%m-%Y') AS formatted_due_date, COALESCE(SUM(payments.amount), 0) AS total_payments
          FROM 
              bills
          LEFT JOIN 
              businesses ON bills.business_id = businesses.business_id
          LEFT JOIN 
              payments ON bills.bill_id = payments.bill_id 
                      AND payments.payment_status = 'approved' 
                      AND payments.entity_type = 'Business'
          WHERE 
              businesses.client_id = ?
              AND bills.bill_id = (SELECT MAX(bill_id) 
                                  FROM bills 
                                  WHERE bills.business_id = businesses.business_id)
          GROUP BY 
              businesses.business_name, 
              businesses.business_id, 
              bills.bill_id`,
        [client_id]
      );
  
      const [propertyRows] = await db.query(
       `SELECT Properties.house_number,Properties.property_id, bills.*, DATE_FORMAT(bills.due_date, '%d-%m-%Y') AS formatted_due_date, COALESCE(SUM(payments.amount), 0) AS total_payments
        FROM bills
        LEFT JOIN Properties ON bills.property_id = Properties.property_id

        LEFT JOIN payments ON bills.bill_id = payments.bill_id AND payments.payment_status = 'approved' AND payments.entity_type = 'Property'
	    WHERE 
            Properties.client_id = ?
            AND bills.bill_id = (SELECT MAX(bill_id) 
                                  FROM bills 
                                  WHERE bills.property_id = Properties.property_id)
        GROUP BY Properties.house_number, Properties.property_id, bills.bill_id;`,
        [client_id]
      );
  
      res.json({
        success: true,
        client: clientRows[0],
        businessPayments: businessRows,
        propertyPayments: propertyRows,
      });
    } catch (error) {
      console.error('Error fetching client data:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  exports.showPaymentPage = (req, res) => {
    try{
        res.render("payments")
    }catch(error){
        console.log(error)
    }
  }

  exports.getPayments = async (req, res) => {
    try{
        const [payments] = await db.query(
            `SELECT payments.*, bills.business_id, bills.property_id, businesses.business_name, Properties.house_number
                FROM payments
                LEFT JOIN bills ON payments.bill_id = bills.bill_id
                LEFT JOIN businesses ON bills.business_id = businesses.business_id
                LEFT JOIN Properties ON bills.property_id = Properties.property_id
                WHERE payment_status = "Pending"`
        )
        res.json(payments)
    }catch(error){
        console.log(error)
    }
  }

  exports.showPaymentApprovalPage = (req, res) => {
    try{
        res.render("paymentApproval")
    }catch(error){
        console.log(error)
    }
  }

  exports.paymentReject = async (req, res) => {
    const paymentId = req.params.id
    const {reason} = req.body
    try {
        [result] = await db.query(
            `UPDATE payments
            SET payment_status = "Rejected"
            WHERE payment_id = ?`,
            [paymentId]
        )
        if(result.affectedRows === 1){
            try{
                [results] = await db.query(
                    `INSERT INTO disapproved_payments(payment_id,reason) VALUES (?, ?)`, [paymentId, reason]
                )
                res.json({msg:"Payment succesfully rejected"})
            }catch(error){
                console.log(error)
                res.status(500).json({msg:"Internal Server Error"})
            }
        }
    }catch(error){
        console.log(error)
    }
  }



exports.paymentApproved = async (req, res) => {
  const { id: paymentId } = req.params;

  let connection; // Declare the connection variable

  try {
      connection = await db.getConnection(); // Initialize connection
      await connection.beginTransaction(); // Start a transaction

      // Step 1: Get payment details
      const [payments] = await connection.query(
          `SELECT * FROM payments WHERE payment_id = ? AND payment_status = "Pending"`,
          [paymentId]
      );

      if (payments.length === 0) {
          return res.status(404).json({ msg: "Payment not found or already processed." });
      }

      const payment = payments[0];
      const { client_id, bill_id, entity_type, entity_id, year, amount, details } = payment;

      // Step 2: Approve payment
      await connection.query(
          `UPDATE payments SET payment_status = "Approved" WHERE payment_id = ?`,
          [paymentId]
      );

      // Step 3: Insert into client_accounts
      await connection.query(
          `INSERT INTO client_accounts (client_id, entity_type, bill_id, transaction_date, details, credit, debit)
           VALUES (?, ?, ?, NOW(), ?, ?, 0.00)`,
          [client_id, entity_type, bill_id, details || "Payment processed", amount]
      );

      // Step 4: Handle arrears reduction
      let remainingAmount = parseFloat(amount);

      const [arrears] = await connection.query(`
          SELECT arrears.arrear_id, arrears.arrear_amount, bills.bill_id, arrears.entity_id
          FROM arrears
          JOIN bills ON 
              arrears.bill_id = bills.bill_id
          WHERE 
              arrears.entity_id = ? 
              AND arrears.cleared_status = 'Uncleared'
          ORDER BY arrears.arrear_year ASC
      `, [entity_id]);

      for (const arrear of arrears) {
          if (remainingAmount <= 0) break;

          const { arrear_id, arrear_amount, bill_id } = arrear;

          if (arrear_amount <= remainingAmount) {
              // Fully clear arrear
              await connection.query(
                  `UPDATE arrears SET arrear_amount = 0, cleared_status = "Cleared", cleared_date = NOW() WHERE arrear_id = ?`,
                  [arrear_id]
              );
              remainingAmount -= arrear_amount;

              // Update the status of the old bill to "Paid"
              console.log({bill_id})
              await connection.query(
                  `UPDATE bills SET bill_status = "Paid" WHERE bill_id = ?`,
                  [bill_id]
              );
          } else {
              // Partially clear arrear
              await connection.query(
                  `UPDATE arrears SET arrear_amount = arrear_amount - ? WHERE arrear_id = ?`,
                  [remainingAmount, arrear_id]
              );
              remainingAmount = 0;
          }
      }
      
      if (remainingAmount > 0) {
          // Adjust the current bill
          const [bill] = await connection.query(
              `SELECT total_amount FROM bills WHERE bill_id = ?`,
              [bill_id]
          );

          if (bill.length === 0) throw new Error(`Bill ID ${bill_id} not found.`);
          console.log({Remaining_Amount: remainingAmount})
          const totalAmount = parseFloat(bill[0].total_amount);
          console.log({totalAmount: totalAmount})
          const newTotal = Math.max(totalAmount - remainingAmount, 0);
          console.log({newTotal: newTotal})
          const newStatus = newTotal === 0 ? "Paid" : "Partial Payment";

          await connection.query(
              `UPDATE bills SET bill_status = ? WHERE bill_id = ?`,
              [newStatus, bill_id]
          );

          remainingAmount -= (totalAmount - newTotal); // Update remainingAmount after bill adjustment
      }

      if (remainingAmount > 0) {
        // Handle overpayment
        await connection.query(
            `INSERT INTO credits (entity_type, entity_id, bill_id, credit_year, credit_amount, date_recorded, credit_status)
             VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
            [entity_type, entity_id, bill_id, year, remainingAmount, "Unused"]
        );

        // Optionally notify about the overpayment
        console.log(`Overpayment of ${remainingAmount} recorded for client ${client_id}`);
    }


      await connection.commit();
    //SMS for Payment
      const [clientDetails] = await db.query(`SELECT clients.contact, clients.firstname FROM clients WHERE clients.client_id = ?`, [client_id])
      console.log(clientDetails)
      const [billDetails] = await db.query(`SELECT 
      bills.total_amount + IFNULL(bills.arrears, 0) AS billAmount,
      CASE WHEN bills.entity_type = 'Business' THEN businesses.business_name
		WHEN bills.entity_type = 'Property' THEN Properties.house_number
		ELSE 'Unknown'
		END AS Entity_Name,
        bills.due_date
        FROM
            bills
        LEFT JOIN businesses ON bills.business_id = businesses.business_id
        LEFT JOIN Properties ON bills.property_id = Properties.property_id
        WHERE
            bills.bill_id = ?`, [bill_id])
        let message = ''
      if(entity_type === "Business"){
      message = `We acknowledge receipt of your Business Operating Permit payment of GHS${amount} for ${billDetails[0].Entity_Name}. The outstanding balance is GHS${parseFloat(billDetails[0].billAmount) - parseFloat(amount)}.`;
      }else if(entity_type === "Property"){
      message = `We acknowledge receipt of your Property Rate payment of GHS${amount} for ${billDetails[0].Entity_Name}. The outstanding balance is GHS${parseFloat(billDetails[0].billAmount) - parseFloat(amount)}.`;
      }
      const msgid = `BILL-${bill_id}`;
      const recipient = `0${clientDetails[0].contact}`
      console.log({recipient,message,msgid})
      if(await sendSMS(recipient, message, msgid)){
      
      res.status(200).json({ msg: "Payment successfully approved and processed." });
      }else{
        res.status(200).json({ msg: "Payment successfully approved and processed But Failed to send SMS" });
      }
  } catch (error) {
      if (connection) await connection.rollback(); // Rollback in case of an error
      console.error("Error approving payment:", error);
      res.status(500).json({ msg: "Internal server error." });
  } finally {
      if (connection) connection.release(); // Release connection
  }
};

const db = require("../config/db");


exports.createPayment = async (req, res) => {
    const {
        client_id,
        bill_id,
        entity_type,
        details,
        jcr_ref,
        payment_date,
        payment_type,
        amount
      } = req.body;
    try {
    
        const [result] = await db.query(
          `INSERT INTO payments (client_id, bill_id, entity_type, details, jcr_ref, payment_date, payment_type, payment_status, amount, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [client_id, bill_id, entity_type, details || null, jcr_ref || null, payment_date, payment_type, "Pending", amount]
        );
    
        const insertedId = result.insertId;
        res.status(201).json({ message: 'Payment successfull', payment_id: insertedId });
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
        FROM clients
        LEFT JOIN businesses ON clients.client_id = businesses.client_id
        LEFT JOIN bills ON clients.client_id = bills.client_id AND bills.entity_type = 'Business'
        LEFT JOIN payments ON bills.bill_id = payments.bill_id AND payments.payment_status = 'approved' AND payments.entity_type = 'Business'
            WHERE clients.client_id = ?
            GROUP BY businesses.business_name, businesses.business_id, bills.bill_id;`,
        [client_id]
      );
  
      const [propertyRows] = await db.query(
       `SELECT Properties.house_number,Properties.property_id, bills.*, DATE_FORMAT(bills.due_date, '%d-%m-%Y') AS formatted_due_date, COALESCE(SUM(payments.amount), 0) AS total_payments
        FROM clients
        LEFT JOIN Properties ON clients.client_id = Properties.client_id
        LEFT JOIN bills ON clients.client_id = bills.client_id AND bills.entity_type = 'Property'
        LEFT JOIN payments ON bills.bill_id = payments.bill_id AND payments.payment_status = 'approved' AND payments.entity_type = 'Property'
	    WHERE clients.client_id = ?
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
    const paymentId = req.params.id
    try{
        [result] = await db.query(
            `UPDATE payments
            SET payment_status = "Approved"
            WHERE payment_id = ?`,
            [paymentId]
        )
        res.json({msg:"Payment Successfully Approved"})
    }catch(error){
        console.log(error)
    }
  }
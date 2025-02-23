const db = require("../config/db");
const { updateBillTotal, insertClientAccount } = require("../controllers/billingServices");
// Fetch bill for businesses
exports.getBusinessBill = async (req, res) => {
    const { clientId, year } = req.query;

    try {
        // Fetch main bill data
        const query = `
            SELECT 
                clientDetails.client_id, 
                clientDetails.firstname, 
                clientDetails.lastname, 
                clientDetails.contact, 
                businessDetails.business_id,
                businessDetails.business_name,
                locationDetails.location,
                bills.entity_type,
                bills.total_amount,
                bills.arrears,
                bills.year,
                bills.due_date,
                bills.bill_id,
                entity_type.division
            FROM clients clientDetails
            LEFT JOIN businesses businessDetails ON clientDetails.client_id = businessDetails.client_id
            LEFT JOIN locations locationDetails ON businessDetails.location_id = locationDetails.location_id
            LEFT JOIN bills ON clientDetails.client_id = bills.client_id AND businessDetails.business_id = bills.business_id
            LEFT JOIN entity_type ON businessDetails.entity_type_id = entity_type.entity_type_id
            WHERE clientDetails.client_id = ? 
              AND bills.year = ? 
              AND bills.entity_type = ?
        `;
        const [bill] = await db.query(query, [clientId, year, "Business"]);

        if (bill.length === 0) {
            return res.status(404).json({
                success: false,
                error: "No business bill found for the specified client and year.",
            });
        }
        // Extract bill IDs
        const billIds = bill.map(b => b.bill_id);

        // Extract business IDs
        const businessIds = bill.map(b => b.business_id)


        // Fetch bill items and fees for the specific bill IDs
        const [billItems] = await db.query(`
            SELECT bill_items.description,
                   bill_items.amount,
                   bill_items.bill_id
            FROM bill_items
            WHERE bill_items.bill_id IN (?)
        `, [billIds]);

        const [fees] = await db.query(`
            SELECT fees.description,
                   fees.amount,
                   fees.bill_id
            FROM fees
            WHERE fees.bill_id IN (?)
        `, [billIds]);

        const [arrears] = await db.query(`
            SELECT arrears.arrear_year,
                   arrears.arrear_amount,
                   arrears.bill_id,
                    arrears.entity_id
            FROM arrears
            WHERE arrears.entity_id IN (?) AND arrears.cleared_status = "Uncleared" AND arrears.arrear_year < ?
        `, [businessIds, year]);

        // Return combined data
        res.status(200).json({ success: true, bill, billItems, fees, arrears });
    } catch (err) {
        console.error("Error fetching business bill:", err);
        res.status(500).json({ success: false, error: "Failed to fetch business bill." });
    }
};

// Fetch bill for properties
exports.getPropertyBill = async (req, res) => {
    const { clientId, year } = req.query;

    try {
        // Fetch main bill data
        const query = `
            SELECT 
                clientDetails.client_id, 
                clientDetails.firstname, 
                clientDetails.lastname, 
                clientDetails.contact, 
                propertyDetails.property_id,
                propertyDetails.house_number,
                locationDetails.location,
                bills.entity_type,
                bills.total_amount,
                bills.arrears,
                bills.year,
                bills.due_date,
                bills.bill_id,
                entity_type.division
            FROM clients clientDetails
            LEFT JOIN Properties propertyDetails ON clientDetails.client_id = propertyDetails.client_id
            LEFT JOIN locations locationDetails ON propertyDetails.location_id = locationDetails.location_id
            LEFT JOIN bills ON clientDetails.client_id = bills.client_id AND propertyDetails.property_id = bills.property_id
            LEFT JOIN entity_type ON propertyDetails.entity_type_id = entity_type.entity_type_id
            WHERE clientDetails.client_id = ? 
              AND bills.year = ? 
              AND bills.entity_type = ?
        `;
        const [bill] = await db.query(query, [clientId, year, "Property"]);

        if (bill.length === 0) {
            return res.status(404).json({
                success: false,
                error: "No property bill found for the specified client and year.",
            });
        }
        // Extract bill IDs
        const billIds = bill.map(b => b.bill_id);

        // Extract business IDs
        const businessIds = bill.map(b => b.business_id)


        // Fetch bill items and fees for the specific bill IDs
        const [billItems] = await db.query(`
            SELECT bill_items.description,
                   bill_items.amount,
                   bill_items.bill_id
            FROM bill_items
            WHERE bill_items.bill_id IN (?)
        `, [billIds]);

        const [fees] = await db.query(`
            SELECT fees.description,
                   fees.amount,
                   fees.bill_id
            FROM fees
            WHERE fees.bill_id IN (?)
        `, [billIds]);

        const [arrears] = await db.query(`
            SELECT arrears.arrear_year,
                   arrears.arrear_amount,
                   arrears.bill_id,
                    arrears.entity_id
            FROM arrears
            WHERE arrears.entity_id IN (?) AND arrears.cleared_status = "Uncleared" AND arrears.arrear_year < ?
        `, [businessIds, year]);

        // Return combined data
        res.status(200).json({ success: true, bill, billItems, fees, arrears });
    } catch (err) {
        console.error("Error fetching business bill:", err);
        res.status(500).json({ success: false, error: "Failed to fetch business bill." });
    }
};

// Fetch bill for signage
exports.getSignageBill = async (req, res) => {
    const { clientId, year } = req.query;

    try {
        // Fetch main bill data
        const query = `
            SELECT 
                clientDetails.client_id, 
                clientDetails.firstname, 
                clientDetails.lastname, 
                clientDetails.contact, 
                signageDetails.signage_id,
                signageDetails.signage_name,
                locationDetails.location,
                bills.entity_type,
                bills.total_amount,
                bills.arrears,
                bills.year,
                bills.due_date,
                bills.bill_id,
                entity_type.division
            FROM clients clientDetails
            LEFT JOIN signage signageDetails ON clientDetails.client_id = signageDetails.client_id
            LEFT JOIN locations locationDetails ON signageDetails.location_id = locationDetails.location_id
            LEFT JOIN bills ON clientDetails.client_id = bills.client_id AND signageDetails.signage_id = bills.signage_id
            LEFT JOIN entity_type ON signageDetails.entity_type_id = entity_type.entity_type_id
            WHERE clientDetails.client_id = ? 
              AND bills.year = ? 
              AND bills.entity_type = ?
        `;
        const [bill] = await db.query(query, [clientId, year, "Signage"]);
        console.log(bill)
        if (bill.length === 0) {
            return res.status(404).json({
                success: false,
                error: "No signage bill found for the specified client and year.",
            });
        }
        // Extract bill IDs
        const billIds = bill.map(b => b.bill_id);

        // Extract business IDs
        const signageIds = bill.map(b => b.signage_id)


        // Fetch bill items and fees for the specific bill IDs
        const [billItems] = await db.query(`
            SELECT bill_items.description,
                   bill_items.amount,
                   bill_items.bill_id
            FROM bill_items
            WHERE bill_items.bill_id IN (?)
        `, [billIds]);

        const [fees] = await db.query(`
            SELECT fees.description,
                   fees.amount,
                   fees.bill_id
            FROM fees
            WHERE fees.bill_id IN (?)
        `, [billIds]);

        const [arrears] = await db.query(`
            SELECT arrears.arrear_year,
                   arrears.arrear_amount,
                   arrears.bill_id,
                    arrears.entity_id
            FROM arrears
            WHERE arrears.entity_id IN (?) AND arrears.cleared_status = "Uncleared" AND arrears.arrear_year < ?
        `, [signageIds, year]);

        // Return combined data
        res.status(200).json({ success: true, bill, billItems, fees, arrears });
    } catch (err) {
        console.error("Error fetching signage bill:", err);
        res.status(500).json({ success: false, error: "Failed to fetch signage bill." });
    }
};


exports.getCollectorBusinessBills = async (req, res) => {
    const { clientId, year, tagged } = req.query;

    try {
        // Fetch main bill data
        const query = `
            SELECT 
                clientDetails.client_id, 
                clientDetails.firstname, 
                clientDetails.lastname, 
                clientDetails.contact, 
                businessDetails.business_id,
                businessDetails.business_name,
                locationDetails.location,
                bills1.entity_type,
                bills1.total_amount,
                bills1.arrears,
                bills1.year,
                bills1.due_date,
                bills1.bill_id,
                entity_type.division
            FROM clients clientDetails
            LEFT JOIN businesses businessDetails ON clientDetails.client_id = businessDetails.client_id
            LEFT JOIN locations locationDetails ON businessDetails.location_id = locationDetails.location_id
            LEFT JOIN bills bills1 ON clientDetails.client_id = bills1.client_id AND businessDetails.business_id = bills1.business_id
            LEFT JOIN collector_bill_assignment ON collector_bill_assignment.bill_id = bills1.bill_id
            LEFT JOIN entity_type ON businessDetails.entity_type_id = entity_type.entity_type_id
			WHERE collector_bill_assignment.collector_id = ?
              AND bills1.year = ?
              AND bills1.entity_type = ?
              AND (businessDetails.tagged = 'Yes' AND ? = 'Yes' OR ? = 'No')
        `;
        const [bill] = await db.query(query, [clientId, year, "Business", tagged,tagged]);

        if (bill.length === 0) {
            return res.status(404).json({
                success: false,
                error: "No business bill found for the specified client and year.",
            });
        }
        // Extract bill IDs
        const billIds = bill.map(b => b.bill_id);

        // Extract business IDs
        const businessIds = bill.map(b => b.business_id)


        // Fetch bill items and fees for the specific bill IDs
        const [billItems] = await db.query(`
            SELECT bill_items.description,
                   bill_items.amount,
                   bill_items.bill_id
            FROM bill_items
            WHERE bill_items.bill_id IN (?)
        `, [billIds]);

        const [fees] = await db.query(`
            SELECT fees.description,
                   fees.amount,
                   fees.bill_id
            FROM fees
            WHERE fees.bill_id IN (?)
        `, [billIds]);

        const [arrears] = await db.query(`
            SELECT arrears.arrear_year,
                   arrears.arrear_amount,
                   arrears.bill_id,
                    arrears.entity_id
            FROM arrears
            WHERE arrears.entity_id IN (?) AND arrears.cleared_status = "Uncleared" AND arrears.arrear_year < ?
        `, [businessIds, year]);

        // Return combined data
        res.status(200).json({ success: true, bill, billItems, fees, arrears });
    } catch (err) {
        console.error("Error fetching business bill:", err);
        res.status(500).json({ success: false, error: "Failed to fetch business bill." });
    }
};


exports.getCollectorPropertyBills = async (req, res) => {
    const { clientId, year, tagged } = req.query;

    try {
        // Fetch main bill data
        const query = `
            SELECT 
                    clientDetails.client_id, 
                    clientDetails.firstname, 
                    clientDetails.lastname, 
                    clientDetails.contact, 
                    propertyDetails.property_id,
                    propertyDetails.house_number,
                    locationDetails.location,
                    bills1.entity_type,
                    bills1.total_amount,
                    bills1.arrears,
                    bills1.year,
                    bills1.due_date,
                    bills1.bill_id,
                    entity_type.division
                FROM clients clientDetails
                LEFT JOIN Properties propertyDetails ON clientDetails.client_id = propertyDetails.client_id
                LEFT JOIN locations locationDetails ON propertyDetails.location_id = locationDetails.location_id
                LEFT JOIN bills bills1 ON clientDetails.client_id = bills1.client_id 
                                    AND propertyDetails.property_id = bills1.property_id
                LEFT JOIN collector_bill_assignment ON collector_bill_assignment.bill_id = bills1.bill_id
                LEFT JOIN entity_type ON propertyDetails.entity_type_id = entity_type.entity_type_id
                WHERE collector_bill_assignment.collector_id = ?
                AND bills1.year = ?
                AND bills1.entity_type = ?
                AND (propertyDetails.tagged = 'Yes' AND ? = 'Yes' OR ? = 'No')
        `;
        const [bill] = await db.query(query, [clientId, year, "Property", tagged,tagged]);

        if (bill.length === 0) {
            return res.status(404).json({
                success: false,
                error: "No property bill found for the specified client and year.",
            });
        }
        // Extract bill IDs
        const billIds = bill.map(b => b.bill_id);

        // Extract business IDs
        const businessIds = bill.map(b => b.business_id)


        // Fetch bill items and fees for the specific bill IDs
        const [billItems] = await db.query(`
            SELECT bill_items.description,
                   bill_items.amount,
                   bill_items.bill_id
            FROM bill_items
            WHERE bill_items.bill_id IN (?)
        `, [billIds]);

        const [fees] = await db.query(`
            SELECT fees.description,
                   fees.amount,
                   fees.bill_id
            FROM fees
            WHERE fees.bill_id IN (?)
        `, [billIds]);

        const [arrears] = await db.query(`
            SELECT arrears.arrear_year,
                   arrears.arrear_amount,
                   arrears.bill_id,
                    arrears.entity_id
            FROM arrears
            WHERE arrears.entity_id IN (?) AND arrears.cleared_status = "Uncleared" AND arrears.arrear_year < ?
        `, [businessIds, year]);

        // Return combined data
        res.status(200).json({ success: true, bill, billItems, fees, arrears });
    } catch (err) {
        console.error("Error fetching property bill:", err);
        res.status(500).json({ success: false, error: "Failed to fetch property bill." });
    }
};

exports.getCollectorSignageBills = async (req, res) => {
    const { clientId, year, tagged } = req.query;

    try {
        // Fetch main bill data
        const query = `
            SELECT 
                    clientDetails.client_id, 
                    clientDetails.firstname, 
                    clientDetails.lastname, 
                    clientDetails.contact, 
                    signageDetails.signage_id,
                    signageDetails.signage_name,
                    locationDetails.location,
                    bills1.entity_type,
                    bills1.total_amount,
                    bills1.arrears,
                    bills1.year,
                    bills1.due_date,
                    bills1.bill_id,
                    entity_type.division
                FROM clients clientDetails
                LEFT JOIN signage signageDetails ON clientDetails.client_id = signageDetails.client_id
                LEFT JOIN locations locationDetails ON signageDetails.location_id = locationDetails.location_id
                LEFT JOIN bills bills1 ON clientDetails.client_id = bills1.client_id 
                                    AND signageDetails.signage_id = bills1.signage_id
                LEFT JOIN collector_bill_assignment ON collector_bill_assignment.bill_id = bills1.bill_id
                LEFT JOIN entity_type ON signageDetails.entity_type_id = entity_type.entity_type_id
                WHERE collector_bill_assignment.collector_id = ?
                AND bills1.year = ?
                AND bills1.entity_type = ?
                AND (signageDetails.tagged = 'Yes' AND ? = 'Yes' OR ? = 'No')
        `;
        const [bill] = await db.query(query, [clientId, year, "Signage", tagged,tagged]);

        if (bill.length === 0) {
            return res.status(404).json({
                success: false,
                error: "No signage bill found for the specified client and year.",
            });
        }
        // Extract bill IDs
        const billIds = bill.map(b => b.bill_id);

        // Extract business IDs
        const signageIds = bill.map(b => b.signage_id)


        // Fetch bill items and fees for the specific bill IDs
        const [billItems] = await db.query(`
            SELECT bill_items.description,
                   bill_items.amount,
                   bill_items.bill_id
            FROM bill_items
            WHERE bill_items.bill_id IN (?)
        `, [billIds]);

        const [fees] = await db.query(`
            SELECT fees.description,
                   fees.amount,
                   fees.bill_id
            FROM fees
            WHERE fees.bill_id IN (?)
        `, [billIds]);

        const [arrears] = await db.query(`
            SELECT arrears.arrear_year,
                   arrears.arrear_amount,
                   arrears.bill_id,
                    arrears.entity_id
            FROM arrears
            WHERE arrears.entity_id IN (?) AND arrears.cleared_status = "Uncleared" AND arrears.arrear_year < ?
        `, [signageIds, year]);

        // Return combined data
        res.status(200).json({ success: true, bill, billItems, fees, arrears });
    } catch (err) {
        console.error("Error fetching signage bill:", err);
        res.status(500).json({ success: false, error: "Failed to fetch signage bill." });
    }
};


// Fetch combined bill for businesses and properties
exports.getCombinedBill = async (req, res) => {
    const { clientId, year } = req.params;

    try {
        const query = `
            SELECT 
                b.id AS bill_id,
                bi.description,
                bi.amount,
                bi.entity_type,
                CASE 
                    WHEN bi.entity_type = 'business' THEN bu.name 
                    WHEN bi.entity_type = 'property' THEN p.name 
                END AS asset_name
            FROM 
                Bills b
            LEFT JOIN 
                Bill_Items bi ON b.id = bi.bill_id
            LEFT JOIN 
                Businesses bu ON bi.entity_id = bu.id AND bi.entity_type = 'business'
            LEFT JOIN 
                Properties p ON bi.entity_id = p.id AND bi.entity_type = 'property'
            WHERE 
                b.client_id = ? AND b.year = ?;
        `;

        const [rows] = await db.query(query, [clientId, year]);
        res.status(200).json({ success: true, data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Failed to fetch combined bill." });
    }
};


exports.createBill = async (req, res) => {
    const { clientId, billItem, fees = [], replace = false } = req.body;
    let connection;

    try {
        if (!clientId || !billItem || !billItem.entity_type || !billItem.entity_id || !billItem.year || !billItem.amount) {
            throw new Error("Missing required fields.");
        }

        const validEntityTypes = ['Business', 'Property', 'Signage'];
        if (!validEntityTypes.includes(billItem.entity_type)) {
            throw new Error('Invalid entity type. Must be "Business" or "Property" or "Signage".');
        }

        let businessId = billItem.entity_type === 'Business' ? billItem.entity_id : null;
        let propertyId = billItem.entity_type === 'Property' ? billItem.entity_id : null;
        let signageId = billItem.entity_type === 'Signage' ? billItem.entity_id : null;

        connection = await db.getConnection();
        await connection.beginTransaction(); // Start transaction

        // 1. Handle Arrears
        const [arrears] = await connection.query(`
            SELECT COALESCE(SUM(arrear_amount), 0) AS total_arrears
            FROM arrears
            WHERE entity_type = ? AND entity_id = ? AND cleared_status = 'Uncleared'
        `, [billItem.entity_type, billItem.entity_id]);

        const totalArrears = parseFloat(arrears[0].total_arrears || 0);

        // 2. Handle Credits
        const [credits] = await connection.query(`
            SELECT credit_id, credit_amount
            FROM credits
            WHERE entity_type = ? AND entity_id = ? AND credit_status = 'Unused'
            ORDER BY credit_id ASC
        `, [billItem.entity_type, billItem.entity_id]);

        let totalCredits = credits.reduce((sum, credit) => sum + parseFloat(credit.credit_amount), 0);

        // 3. Check for Existing Bill
        const [existingBill] = await connection.query(`
            SELECT bill_id FROM bills 
            WHERE client_id = ? AND entity_type = ? AND year = ? AND (business_id = ? OR property_id = ? OR signage_id = ?)
            FOR UPDATE
        `, [clientId, billItem.entity_type, billItem.year, businessId, propertyId, signageId]);

        if (existingBill.length > 0 && !replace) {
            await connection.rollback();
            return res.status(409).json({
                success: false,
                billExists: true,
                message: "A bill for this client and year already exists. Do you want to replace it?",
                billId: existingBill[0].bill_id
            });
        }

        if (existingBill.length > 0) {
            const oldBillId = existingBill[0].bill_id;
            await connection.query(`DELETE FROM collector_bill_assignment WHERE bill_id = ?`, [oldBillId])
            await connection.query(`DELETE FROM sms WHERE bill_id = ?`, [oldBillId])
            await connection.query(`DELETE FROM fees WHERE bill_id = ?`, [oldBillId]);
            await connection.query(`DELETE FROM bill_items WHERE bill_id = ?`, [oldBillId]);
            await connection.query(`DELETE FROM bills WHERE bill_id = ?`, [oldBillId]);   
        }

        // 4. Create Bill
        const [result] = await connection.query(`
            INSERT INTO bills (client_id, entity_type, business_id, property_id, signage_id, year, total_amount, arrears, credits, date_created, due_date, bill_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, 'Draft')
        `, [clientId, billItem.entity_type, businessId, propertyId, signageId, billItem.year, billItem.amount, totalArrears, totalCredits, billItem.due_date]);

        const billId = result.insertId;

        // 5. Insert Bill Items and Fees
        await connection.query(`
            INSERT INTO bill_items (bill_id, entity_id, year, description, amount)
            VALUES (?, ?, ?, ?, ?)
        `, [billId, billItem.entity_id, billItem.year, billItem.description, billItem.amount]);

        if (fees.length > 0) {
            const feeInserts = fees.map(fee => [billId, fee.description, fee.amount]);
            await connection.query(`INSERT INTO fees (bill_id, description, amount) VALUES ?`, [feeInserts]);
        }

        // 6. Update Total Amount with Credits
        const [totals] = await connection.query(`
            SELECT
                COALESCE(bi_total.billItemsTotal, 0) AS billItemsTotal,
                COALESCE(f_total.feesTotal, 0) AS feesTotal
            FROM 
                (SELECT bill_id, SUM(amount) AS billItemsTotal
                FROM bill_items
                WHERE bill_id = ?
                GROUP BY bill_id) bi_total
            LEFT JOIN
                (SELECT bill_id, SUM(amount) AS feesTotal
                FROM fees
                WHERE bill_id = ?
                GROUP BY bill_id) f_total
            ON bi_total.bill_id = f_total.bill_id;
        `, [billId, billId]);

        let updatedTotal = parseFloat(totals[0].billItemsTotal || 0) +
            parseFloat(totals[0].feesTotal || 0) +
            totalArrears;

        let debitTotal = parseFloat(totals[0].billItemsTotal || 0) +
            parseFloat(totals[0].feesTotal || 0);

        if (totalCredits > 0) {
            if (totalCredits >= updatedTotal) {
                // Fully cover the bill with credits
                totalCredits -= updatedTotal;
                updatedTotal = 0;

                // Mark credits as fully used
                for (const credit of credits) {
                    await connection.query(`
                        UPDATE credits 
                        SET credit_status = 'Used', used_date = NOW() 
                        WHERE credit_id = ?
                    `, [credit.credit_id]);
                }
            } else {
                // Partially cover the bill with credits
                updatedTotal -= totalCredits;

                for (const credit of credits) {
                    if (totalCredits <= 0) break;

                    if (credit.credit_amount <= totalCredits) {
                        await connection.query(`
                            UPDATE credits 
                            SET credit_status = 'Used', used_date = NOW() 
                            WHERE credit_id = ?
                        `, [credit.credit_id]);

                        totalCredits -= credit.credit_amount;
                    } else {
                        await connection.query(`
                            UPDATE credits 
                            SET credit_amount = credit_amount - ?, used_date = NOW() 
                            WHERE credit_id = ?
                        `, [totalCredits, credit.credit_id]);

                        totalCredits = 0;
                    }
                }
            }
        }

        await connection.query(`
            UPDATE bills 
            SET total_amount = ? 
            WHERE bill_id = ?
        `, [debitTotal, billId]);

        // 7. Insert Client Account
        await connection.commit();

        await db.query(`
            INSERT INTO client_accounts (
                client_id, entity_type, transaction_date, details, year, credit, debit, bill_id
            ) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)
        `, [clientId, billItem.entity_type, billItem.entity_type === "Business" ? "Business Operating Permit" : (billItem.entity_type === "Property") ? "Property Rate" : "Signage Operating Permit", billItem.year, 0.00, updatedTotal, billId]);

        // 8. Send SMS to DB
        let message = ""
        const [clientDetails] = await db.query(`SELECT clients.contact, clients.firstname, clients.lastname FROM clients WHERE client_id = ?`, [clientId]);
        
        if(billItem.entity_type === "Business"){
            const [businessDetails] = await db.query(`SELECT businesses.business_name FROM businesses WHERE business_id = ?`, [businessId])
            message = `Dear ${clientDetails[0].firstname} ${clientDetails[0].lastname}, your Business Operating Permit bill for ${businessDetails[0].business_name} is GHS${updatedTotal}. Payment can be made to any of our Authorized Revenue Collectors or Directly to the Municipal Assembly. Kindly ensure that this bill is settled by ${billItem.due_date}. For further enquiries, please contact 0244086192. Thank you for your cooperation.`
        }else if (billItem.entity_type === "Property"){
            const [propertyDetails] = await db.query(`SELECT Properties.house_number FROM Properties WHERE property_id = ?`, [propertyId])
            message = `Dear ${clientDetails[0].firstname} ${clientDetails[0].lastname}, your Property Rate bill for ${propertyDetails[0].house_number} is GHS${updatedTotal}. Payment can be made to any of our Authorized Revenue Collectors or Directly to the Municipal Assembly. Kindly ensure that this bill is settled by ${billItem.due_date}. For further enquiries, please contact 0244086192. Thank you for your cooperation.`
        }else{
            const [signageDetails] = await db.query(`SELECT signage.signage_name FROM signage WHERE signage_id = ?`, [signageId])
            message = `Dear ${clientDetails[0].firstname} ${clientDetails[0].lastname}, your Signage Operating Permit bill for ${signageDetails[0].signage_name} is GHS${updatedTotal}. Payment can be made to any of our Authorized Revenue Collectors or Directly to the Municipal Assembly. Kindly ensure that this bill is settled by ${billItem.due_date}. For further enquiries, please contact 0244086192. Thank you for your cooperation.`
        }

        await db.query(`
            INSERT INTO sms (bill_id, recipient, message, status) VALUES (?, ?, ?, "Pending")
            `, [billId, clientDetails[0].contact, message]
        )

        res.status(201).json({
            success: true,
            billId,
            updatedTotal,
            totalArrears,
            totalCredits,
            message: updatedTotal === 0
                ? "Bill created successfully and fully covered by credits."
                : "Bill created successfully with partial credits applied."
        });
    } catch (err) {
        if (connection) await connection.rollback();
        console.error("Transaction failed:", err);

        res.status(500).json({
            success: false,
            error: err.message || "Failed to create bill."
        });
    } finally {
        if (connection) connection.release();
    }
};


//Get Billing Page

exports.showBillingPage = (req, res) =>{
    res.render("billing")
}


// Get client details, businesses, properties, and fee-fixing rates
exports.getClientBillData = async (req, res) => {
    const clientId = req.query.client_id;

    if (!clientId) {
        return res.status(400).json({ success: false, error: "Client ID is required" });
    }

    try {
        // Fetch client details
        const [clientRows] = await db.query(`SELECT * FROM clients WHERE client_id = ?`, [clientId]);
        if (clientRows.length === 0) {
            return res.status(404).json({ success: false, error: "Client not found" });
        }
        const client = clientRows[0];

        // Fetch businesses owned by the client
        const [businessRows] = await db.query(`
            SELECT b.*, t.division AS business_type, f.amount AS amount, f.category AS category, t.entity_type
            FROM businesses b
            LEFT JOIN fee_fixing f ON b.fee_fixing_id = f.fee_fixing_id
            LEFT JOIN entity_type t ON b.entity_type_id = t.entity_type_id
            WHERE b.client_id = ?
        `, [clientId]);

        const businesses = businessRows.map(row => ({
            entity_id: row.business_id,
            entity_type: row.entity_type,
            business_name: row.business_name,
            business_type: row.business_type,
            category: row.category,
            amount: row.amount,
        }));

       // Fetch properties owned by the client
        const [propertyRows] = await db.query(`
            SELECT p.*, t.division AS property_type, f.amount AS amount, f.category AS category, t.entity_type
            FROM Properties p
            LEFT JOIN fee_fixing f ON p.fee_fixing_id = f.fee_fixing_id
            LEFT JOIN entity_type t ON p.entity_type_id = t.entity_type_id
            WHERE p.client_id = ?
        `, [clientId]);

        const properties = propertyRows.map(row => ({
                    entity_id: row.property_id,
                    entity_type: row.entity_type,
                    house_number: row.house_number,
                    property_type: row.property_type,
                    category: row.category,
                    amount: row.amount,
                })); 

        // Fetch signages owned by the client
        const [signageRows] = await db.query(`
            SELECT s.*, t.division AS signage_type, f.amount AS amount, f.category AS category, t.entity_type
            FROM signage s
            LEFT JOIN fee_fixing f ON s.fee_fixing_id = f.fee_fixing_id
            LEFT JOIN entity_type t ON s.entity_type_id = t.entity_type_id
            WHERE s.client_id = ?
        `, [clientId]);

        const signages = signageRows.map(row => ({
                    entity_id: row.signage_id,
                    entity_type: row.entity_type,
                    signage_name: row.signage_name,
                    signage_type: row.signage_type,
                    category: row.category,
                    amount: row.amount,
                })); 
                
        res.status(200).json({
            success: true,
            client,
            businesses,
            properties,
            signages
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Failed to fetch client bill data." });
    }
};

// Save the finalized bill
exports.saveBill = async (req, res) => {
    const { client, billableItems } = req.body;

    if (!client || !billableItems || billableItems.length === 0) {
        return res.status(400).json({ success: false, error: "Invalid bill data" });
    }

    try {
        // Calculate total amount
        const totalAmount = billableItems.reduce((sum, item) => sum + parseFloat(item.amount), 0);

        // Insert the bill
        const [billResult] = await db.query(`
            INSERT INTO Bills (client_id, year, total_amount, date_created)
            VALUES (?, YEAR(CURDATE()), ?, NOW())
        `, [client.id, totalAmount]);

        const billId = billResult.insertId;

        // Insert bill items
        const itemInserts = billableItems.map(item => [
            billId,
            item.entity_id || null,
            item.entity || null,
            item.description,
            item.amount,
        ]);

        await db.query(`
            INSERT INTO Bill_Items (bill_id, entity_id, entity_type, description, amount)
            VALUES ?
        `, [itemInserts]);

        res.status(201).json({ success: true, billId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Failed to save bill." });
    }
};

exports.populateArrears = async (req, res) => {
    try {
        const connection = await db.getConnection();

        // Step 1: Fetch overdue or partially paid bills
        const [overdueBills] = await connection.query(`
            SELECT b.bill_id, b.entity_type, b.business_id, b.property_id, b.signage_id, b.year, 
                   (b.total_amount - COALESCE(SUM(p.amount), 0)) AS outstanding_amount
            FROM bills b
            LEFT JOIN payments p ON b.bill_id = p.bill_id
            WHERE b.bill_status IN ('Draft','Issued','Overdue', 'Partial Payment')
            GROUP BY b.bill_id
            HAVING outstanding_amount > 0
        `);
        // Step 2: Insert into the arrears table
        for (const bill of overdueBills) {
            await connection.query(`
                INSERT INTO arrears (entity_type, entity_id, bill_id, arrear_year, arrear_amount, cleared_status, date_recorded)
                VALUES (?, ?, ?, ?, ?, 'Uncleared', NOW())
                ON DUPLICATE KEY UPDATE 
                    arrear_amount = VALUES(arrear_amount),
                    cleared_status = 'Uncleared';
            `, [
                bill.entity_type,
                bill.business_id || bill.property_id || bill.signage_id,
                bill.bill_id,
                bill.year,
                bill.outstanding_amount
            ]);
        }
        res.json({msg:"Arrears table updated successfully."})
    } catch (error) {
        console.error("Error populating arrears:", error);
    }
};


exports.getBillByStatus = async (req, res) => {
    const { status } = req.query
   
    try{
    const [results] = await db.query(`
        SELECT 
            b.bill_id AS Bill_ID,
            CASE 
                WHEN b.entity_type = 'Business' THEN bu.business_name
                WHEN b.entity_type = 'Property' THEN p.house_number
                WHEN b.entity_type = 'Signage' THEN s.signage_name
                ELSE 'Unknown'
            END AS Entity_Name,
            b.entity_type AS Entity_Type,
            l.location AS Location,
            (b.total_amount + IFNULL(b.arrears, 0)) AS Bill_Amount,
            rc.name AS Collector_Assigned
        FROM bills b
        LEFT JOIN businesses bu ON b.business_id = bu.business_id
        LEFT JOIN Properties p ON b.property_id = p.property_id
        LEFT JOIN signage s ON b.signage_id = s.signage_id
        LEFT JOIN locations l ON bu.location_id = l.location_id OR p.location_id = l.location_id OR s.location_id = l.location_id
        LEFT JOIN collector_bill_assignment cba ON b.bill_id = cba.bill_id
        LEFT JOIN revenue_collector rc ON cba.collector_id = rc.collector_id
        WHERE 
        CASE 
            WHEN ? = 'ALL' THEN TRUE
            ELSE b.bill_assigned = ?
        END;

        `, [status,status]
    )

    res.json({ bills: results});
    }
    catch(error){
        console.error('Error fetching bills:', error);
        res.status(500).send('Error fetching bills');
    }
}
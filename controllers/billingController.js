const db = require("../config/db");

// Fetch bill for businesses
exports.getBusinessBill = async (req, res) => {
    const { clientId, year } = req.query;

    try {
        let query = `
            SELECT 	clientDetails.client_id, 
                    clientDetails.firstname, 
                    clientDetails.lastname, 
                    clientDetails.contact, 
                    businessDetails.business_id,
                    locationDetails.location,
                    bills.entity_type,
                    bills.total_amount,
                    bills.year
            FROM clients clientDetails
            LEFT JOIN businesses businessDetails ON clientDetails.client_id = businessDetails.client_id
            LEFT JOIN locations locationDetails ON businessDetails.location_id = locationDetails.location_id
            LEFT JOIN bills  ON clientDetails.client_id = bills.client_id
            WHERE clientDetails.client_id = ? AND bills.year = ? AND bills.entity_type = ?
        `;

        const [bill] = await db.query(query, [clientId, year, "Business"]);

         // Handle empty results
         if (bill.length === 0) {
            return res.status(404).json({
                success: false,
                error: "No business bill found for the specified client and year."
            });
        }
        query = `
            SELECT 	bill_items.description,
                    bill_items.amount
            FROM clients
            LEFT JOIN bills ON clients.client_id = bills.client_id
            LEFT JOIN bill_items ON bills.bill_id = bill_items.bill_id
            WHERE clients.client_id = "NAMA0005" AND bills.year = 2031 AND bills.entity_type = "Business"
        `;
        const [billItems] = await db.query(query, [clientId, year, "Business"])

        query = `
            SELECT 	fees.description,
                    fees.amount
            FROM clients
            LEFT JOIN bills ON clients.client_id = bills.client_id
            LEFT JOIN fees ON bills.bill_id = fees.bill_id
            WHERE clients.client_id = "NAMA0005" AND bills.year = 2031 AND bills.entity_type = "Business"
        `;
        const [fees] = await db.query(query, [clientId, year, "Business"])

        res.status(200).json({ success: true, bill, billItems, fees });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Failed to fetch business bill." });
    }
};

// Fetch bill for properties
exports.getPropertyBill = async (req, res) => {
    const { clientId, year } = req.params;

    try {
        const query = `
            SELECT 
                b.id AS bill_id,
                bi.description,
                bi.amount,
                p.name AS property_name
            FROM 
                Bills b
            JOIN 
                Bill_Items bi ON b.id = bi.bill_id
            JOIN 
                Properties p ON bi.entity_id = p.id
            WHERE 
                b.client_id = ? AND bi.entity_type = 'property' AND b.year = ?;
        `;

        const [rows] = await db.query(query, [clientId, year]);
        res.status(200).json({ success: true, data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Failed to fetch property bill." });
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

// // Generate a new bill (create entries)
// exports.createBill = async (req, res) => {
//     const { clientId, billItems, fees } = req.body;

//     try {
//         // Insert the bill summary
//         const [result] = await db.query(`
//             INSERT INTO bills (client_id, year, total_amount, date_created)
//             VALUES (?, ?, ?, NOW())
//         `, [clientId, year, billItems.reduce((sum, item) => sum + item.amount, 0)]);

//         const billId = result.insertId;

//         // Insert bill items
//         const itemInserts = billItems.map(item => [
//             billId, 
//             item.entity_id, 
//             item.entity_type, 
//             item.description, 
//             item.amount
//         ]);

//         await db.query(`
//             INSERT INTO bill_Items (bill_id, entity_id, entity_type, description, amount)
//             VALUES ?
//         `, [itemInserts]);

//         res.status(201).json({ success: true, billId });

//         // Insert extra fees
//         const feeInserts = fees.map(fee => [billId, fee.description, fee.amount]);
//         await db.query(`
//             INSERT INTO fees (bill_id, description, amount)
//             VALUES ?
//         `, [feeInserts]);

//         res.status(201).json({ success: true, billId });

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ success: false, error: "Failed to create bill." });
//     }

    
//};
// Generate a new bill (create entries)
exports.createBill = async (req, res) => {
    const { clientId, billItem, fees = [], replace = false } = req.body;
    console.log(req.body)
    let connection;

    try {
        // Get a database connection
        connection = await db.getConnection();
        await connection.beginTransaction(); // Start the transaction

        // Check if a bill already exists
        const [existingBill] = await connection.query(`
            SELECT bill_id FROM bills 
            WHERE client_id = ? AND entity_type = ? AND year = ?
            FOR UPDATE
        `, [clientId, billItem.entity_type, billItem.year]);

        if (existingBill.length > 0) {
            if (!replace) {
                // Inform the user that the bill exists
                await connection.rollback();
                return res.status(409).json({
                    success: false,
                    billExists: true,
                    message: "A bill for this client and year already exists. Do you want to replace it?",
                    billId: existingBill[0].bill_id
                });
            }

            // Delete the old bill and associated items if replace = true
            const oldBillId = existingBill[0].bill_id;
            await connection.query(`DELETE FROM fees WHERE bill_id = ?`, [oldBillId]);
            await connection.query(`DELETE FROM bill_items WHERE bill_id = ?`, [oldBillId]);
            await connection.query(`DELETE FROM bills WHERE bill_id = ?`, [oldBillId]);
        }

        // Insert the new bill summary
        let businessId = null;
        let propertyId = null;
    
        // Determine which field to populate based on entity_type
        if (billItem.entity_type === 'Business') {
            businessId = billItem.entity_id;
            // Assuming billItem contains the business_id
        } else if (billItem.entity_type === 'Property') {
            propertyId = billItem.entity_id; // Assuming billItem contains the property_id
        } else {
            throw new Error('Invalid entity type. Must be "business" or "property".');
        }
        const [result] = await connection.query(`
            INSERT INTO bills (client_id, entity_type, business_id, property_id, year, total_amount, date_created, due_date, bill_status)
            VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?)
        `, [clientId, billItem.entity_type, businessId, propertyId, billItem.year, billItem.amount, "2024-12-31","Draft"]);

        const billId = result.insertId;

        // Insert the main bill item
        await connection.query(`
            INSERT INTO bill_items (bill_id, entity_id, year, description, amount)
            VALUES (?, ?, ?, ?, ?)
        `, [billId, billItem.entity_id, billItem.year, billItem.description, billItem.amount]);

        // Insert extra fees if any
        if (Array.isArray(fees) && fees.length > 0) {
            const feeInserts = fees.map(fee => [billId, fee.description, fee.amount]);
            await connection.query(`
                INSERT INTO fees (bill_id, description, amount)
                VALUES ?
            `, [feeInserts]);
        }

        // Commit the transaction
        await connection.commit();

        res.status(201).json({ success: true, billId, message: "Bill created successfully." });

    } catch (err) {
        console.error("Transaction failed:", err);

        // Rollback the transaction in case of an error
        if (connection) await connection.rollback();

        res.status(500).json({
            success: false,
            error: err.message || "Failed to create bill."
        });
    } finally {
        // Release the connection back to the pool
        if (connection) await connection.release();
    }
};

//Get Billing Page

exports.showBillingPage = (req, res) =>{
    res.render("billing")
}

// just testing codes

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
                
        res.status(200).json({
            success: true,
            client,
            businesses,
            properties
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

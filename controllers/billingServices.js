const db = require("../config/db");

exports.updateBillTotal = async (billId) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                COALESCE(SUM(bi.amount), 0) AS billItemsTotal,
                COALESCE(SUM(f.amount), 0) AS feesTotal
            FROM bill_items bi
            LEFT JOIN fees f ON f.bill_id = bi.bill_id
            WHERE bi.bill_id = ?
        `, [billId]);

        const totalAmount = (rows[0].billItemsTotal || 0) + (rows[0].feesTotal || 0);

        await db.query(`
            UPDATE bills 
            SET total_amount = ? 
            WHERE bill_id = ?
        `, [totalAmount, billId]);
    } catch (err) {
        console.error("Error updating bill total:", err);
        throw err;
    }
};

exports.insertClientAccount = async (bill) => {
    try {
        const description = bill.entity_type === 'Business'
            ? 'Business Operating Permit'
            : bill.entity_type === 'Property'
            ? 'Property Rate'
            : bill.entity_type;

        await db.query(`
            INSERT INTO client_accounts (
                client_id, entity_type, transaction_date, details, year, credit, debit, bill_id
            ) VALUES (?, ?, NOW(), ?, ?, 0.00, ?, ?)
        `, [bill.client_id, bill.entity_type, description, bill.year, bill.total_amount, bill.bill_id]);
    } catch (err) {
        console.error("Error inserting into client accounts:", err);
        throw err;
    }
};

exports.updateClientAccountDebit = async (billId, totalAmount) => {
    try {
        await db.query(`
            UPDATE client_accounts 
            SET debit = ? 
            WHERE bill_id = ?
        `, [totalAmount, billId]);
    } catch (err) {
        console.error("Error updating client account debit:", err);
        throw err;
    }
};

exports.deleteClientAccount = async (billId) => {
    try {
        await db.query(`
            DELETE FROM client_accounts 
            WHERE bill_id = ?
        `, [billId]);
    } catch (err) {
        console.error("Error deleting client account:", err);
        throw err;
    }
};

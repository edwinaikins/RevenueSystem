const db = require('../config/db');

exports.showPage = (req, res) => {
    res.render("collectors")
}

exports.showPageBillAssignment = (req, res) => {
    res.render("billAssignment")
}

exports.showPageCollectorBills = (req, res) => {
    res.render("collectorBills")
}


// Get collectors with pagination and search
exports.getCollectors = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 20;
    const offset = (page - 1) * pageSize;
    const query = req.query.q ? `%${req.query.q}%` : '%';

    try {
        const [collectors] = await db.query(
            'SELECT * FROM revenue_collector WHERE name LIKE ? LIMIT ?, ?',
            [query, offset, pageSize]
        );
        const [[{ count }]] = await db.query(
            'SELECT COUNT(*) AS count FROM revenue_collector WHERE name LIKE ?',
            [query]
        );

        const totalPages = Math.ceil(count / pageSize);
        res.json({ collectors, currentPage: page, totalPages });
    } catch (error) {
        console.error('Error fetching collectors:', error);
        res.status(500).send('Error fetching collectors');
    }
};
// Get collectors
exports.getCollector = async (req, res) => {

    try {
        const [collectors] = await db.query(
            'SELECT * FROM revenue_collector',
        );
        res.json({ collectors });
    } catch (error) {
        console.error('Error fetching collectors:', error);
        res.status(500).send('Error fetching collectors');
    }
};

// Add a new collector
exports.addCollector = async (req, res) => {
    const { name, contact } = req.body;

    try {
        const [result] = await db.query(
            'INSERT INTO revenue_collector (name, contact) VALUES (?, ?)',
            [name, contact]
        );
        if (result.affectedRows > 0) {
            res.status(201).send('Collector added successfully');
        } else {
            res.status(400).send('Failed to add collector');
        }
    } catch (error) {
        console.error('Error adding collector:', error);
        res.status(500).send('Error adding collector');
    }
};

// Update a collector
exports.updateCollector = async (req, res) => {
    const { id } = req.params;
    const { name, contact } = req.body;

    try {
        const [result] = await db.query(
            'UPDATE revenue_collector SET name = ?, contact = ? WHERE collector_id = ?',
            [name, contact, id]
        );
        if (result.affectedRows > 0) {
            res.send('Collector updated successfully');
        } else {
            res.status(404).send('Collector not found');
        }
    } catch (error) {
        console.error('Error updating collector:', error);
        res.status(500).send('Error updating collector');
    }
};

// Delete a collector
exports.deleteCollector = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query(
            'DELETE FROM revenue_collector WHERE collector_id = ?',
            [id]
        );
        if (result.affectedRows > 0) {
            res.send('Collector deleted successfully');
        } else {
            res.status(404).send('Collector not found');
        }
    } catch (error) {
        console.error('Error deleting collector:', error);
        res.status(500).send('Error deleting collector');
    }
};

exports.billAssign =  async (req, res) => {
    const { collectorId, billIds } = req.body;
    console.log(req.body)
    if (!collectorId || !Array.isArray(billIds) || billIds.length === 0) {
        return res.status(400).json({ message: 'Invalid input. Please provide collectorId and billIds.' });
    }
        const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const assignmentDate = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format as MySQL datetime

        // Insert into collector_bill_assignment
        const insertValues = billIds.map(billId => [
            collectorId,
            billId,
            'Bill Collected',
            assignmentDate
        ]);

        const insertQuery = `
            INSERT INTO collector_bill_assignment (collector_id, bill_id, distribution_status, assignment_date)
            VALUES ?
        `;

        await connection.query(insertQuery, [insertValues]);

        // Update bill status to 'Issued'
        const updateQuery = `
            UPDATE bills
            SET bill_status = 'Issued',
                bill_assigned = 'Yes'
            WHERE bill_id IN (?)
        `;

        await connection.query(updateQuery, [billIds]);

        // Commit the transaction
        await connection.commit();
        connection.release();

        return res.status(201).json({
            message: `${billIds.length} bills successfully assigned and updated to 'Issued'.`,
            assignedBills: billIds
        });
    } catch (error) {
        console.error('Error assigning bills:', error);

        // Rollback transaction in case of error
        if (connection) await connection.rollback();
        if (connection) connection.release();

        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

exports.reassignBill = async (req, res) => {
    const { billId, collectorId} = req.body

    try{
        const [ result ] = await db.query( `
            UPDATE collector_bill_assignment
            SET collector_id = ?
            WHERE bill_id = ?
            `,
            [collectorId, billId]
        )
        if (result.affectedRows > 0) {
            res.send('Bill reasigned successfully');
        } else {
            res.status(404).send('bill not found');
        }
    }catch(error){
        console.error('Error reassigning bill:', error);
        res.status(500).send('Error reassigning bill');
    }
}

exports.getCollectorBills = async (req, res) => {
    const { collectorId } = req.params;
    const { page = 1, limit = 10, searchTerm = "" } = req.query;

    // Validate inputs
    if (!collectorId || isNaN(Number(collectorId))) {
        return res.status(400).json({ message: "Invalid collector ID" });
    }

    const offset = (page - 1) * limit;

    try {
        // Fetch collector details
        const [collector] = await db.query(
            "SELECT * FROM revenue_collector WHERE collector_id = ?",
            [collectorId]
        );

        if (!collector.length) {
            return res.status(404).json({ message: "Collector not found" });
        }

        // Search filter
        const searchQuery = `%${searchTerm}%`;

        // Count total bills (for pagination)
        const [totalBills] = await db.query(`
            SELECT COUNT(*) AS total FROM collector_bill_assignment cba
            LEFT JOIN bills b ON cba.bill_id = b.bill_id
            LEFT JOIN businesses bu ON b.business_id = bu.business_id
            LEFT JOIN Properties p ON b.property_id = p.property_id
            LEFT JOIN signage s ON b.signage_id = s.signage_id
            WHERE cba.collector_id = ? AND 
                (bu.business_name LIKE ? OR p.house_number LIKE ? OR s.signage_name LIKE ? OR b.entity_type LIKE ?)
        `, [collectorId, searchQuery, searchQuery, searchQuery, searchQuery]);

        const total = totalBills[0]?.total || 0;

        // Fetch paginated and filtered bills
        const [assignedBills] = await db.query(`
            SELECT 
                cba.distribution_status,
                CASE 
                    WHEN b.entity_type = 'Business' THEN bu.business_name
                    WHEN b.entity_type = 'Property' THEN p.house_number
                    WHEN b.entity_type = 'Signage' THEN s.signage_name
                    ELSE 'Unknown'
                END AS Entity_Name,
                b.entity_type AS Entity_Type,
                b.bill_id AS Bill_ID,
                l.location AS Location,
                (b.total_amount + IFNULL(b.arrears, 0)) AS Bill_Amount
            FROM collector_bill_assignment cba
            LEFT JOIN bills b ON cba.bill_id = b.bill_id
            LEFT JOIN businesses bu ON b.business_id = bu.business_id
            LEFT JOIN Properties p ON b.property_id = p.property_id
            LEFT JOIN signage s ON b.signage_id = s.signage_id
            LEFT JOIN locations l ON bu.location_id = l.location_id OR p.location_id = l.location_id OR s.location_id = l.location_id
            WHERE cba.collector_id = ? AND 
                (bu.business_name LIKE ? OR p.house_number LIKE ? OR s.signage_name LIKE ? OR b.entity_type LIKE ?)
            LIMIT ? OFFSET ?
        `, [collectorId, searchQuery, searchQuery, searchQuery, searchQuery, Number(limit), Number(offset)]);

        res.json({
            collector: collector[0],
            bills: assignedBills,
            pagination: {
                total,
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching collector details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


exports.updateDistributionStatus = async (req, res) => {
    const {bill_id, distribution_status} = req.body
    console.log(req.body)
    try{
        const [result] = await db.query(`
            UPDATE collector_bill_assignment SET distribution_status = ? WHERE bill_id = ?
            `,[distribution_status, bill_id])

            if (result.affectedRows > 0) {
                res.json({msg:'Distribution Status updated successfully'});
            } else {
                res.status(404).send('bill not found');
            }
        } catch (error) {
            console.error('Error updating distribution status:', error);
            res.status(500).send('Error distribution status');
        }
}

exports.getCollectorBusinessSummary = async (req, res) => {
    const { collectorId, year, tagged, filterOption } = req.params;
    console.log(req.params)
    const { page = 1, limit = 1000} = req.query;

    // Validate inputs
    if (!collectorId || isNaN(Number(collectorId))) {
        return res.status(400).json({ message: "Invalid collector ID" });
    }

    const offset = (page - 1) * limit;

    try {
        // Fetch collector details
        const [collector] = await db.query(
            "SELECT * FROM revenue_collector WHERE collector_id = ?",
            [collectorId]
        );

        if (!collector.length) {
            return res.status(404).json({ message: "Collector not found" });
        }


        // Count total bills (for pagination)
        const [totalBills] = await db.query(`
            SELECT COUNT(*) AS total FROM collector_bill_assignment cba
            LEFT JOIN bills b ON cba.bill_id = b.bill_id
            LEFT JOIN businesses bu ON b.business_id = bu.business_id
            WHERE cba.collector_id = ? AND b.entity_type = ? AND b.year = ? AND (bu.tagged = 'Yes' AND ? = 'Yes' OR ? = 'No')
        `, [collectorId, "Business", year, tagged,tagged]);

        const total = totalBills[0]?.total || 0;

        // Fetch paginated and filtered bills
        const [assignedBills] = await db.query(`
           SELECT 	
                clients.firstname,
                clients.lastname,
                clients.contact,
                clients.client_id,
                bu.business_name,
                bu.business_id,
                entity_type.division,
                l.location AS Location,
                b.year,
                (b.total_amount + IFNULL(b.arrears, 0)) AS Bill_Amount
            FROM collector_bill_assignment cba
            LEFT JOIN bills b ON cba.bill_id = b.bill_id
            LEFT JOIN businesses bu ON b.business_id = bu.business_id
            LEFT JOIN entity_type ON bu.entity_type_id = entity_type.entity_type_id
            LEFT JOIN locations l ON bu.location_id = l.location_id
            LEFT JOIN clients ON bu.client_id = clients.client_id
            WHERE cba.collector_id = ? AND b.entity_type = ? AND b.year = ? AND (bu.tagged = 'Yes' AND ? = 'Yes' OR ? = 'No')
            ORDER BY ${filterOption}
            LIMIT ? OFFSET ?
        `, [collectorId, "Business", year, tagged, tagged, Number(limit), Number(offset)]);

        res.json({
            collector: collector[0],
            bills: assignedBills,
            pagination: {
                total,
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching collector details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


exports.getCollectorPropertySummary = async (req, res) => {
    const { collectorId, year, tagged } = req.params;
    const { page = 1, limit = 1000} = req.query;

    // Validate inputs
    if (!collectorId || isNaN(Number(collectorId))) {
        return res.status(400).json({ message: "Invalid collector ID" });
    }

    const offset = (page - 1) * limit;

    try {
        // Fetch collector details
        const [collector] = await db.query(
            "SELECT * FROM revenue_collector WHERE collector_id = ?",
            [collectorId]
        );

        if (!collector.length) {
            return res.status(404).json({ message: "Collector not found" });
        }


        // Count total bills (for pagination)
        const [totalBills] = await db.query(`
            SELECT COUNT(*) AS total FROM collector_bill_assignment cba
            LEFT JOIN bills b ON cba.bill_id = b.bill_id
            LEFT JOIN Properties p ON b.property_id = p.property_id
            WHERE cba.collector_id = ? AND b.entity_type = ? AND b.year = ? AND (p.tagged = 'Yes' AND ? = 'Yes' OR ? = 'No')
        `, [collectorId, "Property", year, tagged,tagged]);

        const total = totalBills[0]?.total || 0;

        // Fetch paginated and filtered bills
        const [assignedBills] = await db.query(`
           SELECT 	
                clients.firstname,
                clients.lastname,
                clients.contact,
                clients.client_id,
                p.house_number,
                p.property_id,
                entity_type.division,
                l.location AS Location,
                b.year,
                (b.total_amount + IFNULL(b.arrears, 0)) AS Bill_Amount
            FROM collector_bill_assignment cba
            LEFT JOIN bills b ON cba.bill_id = b.bill_id
            LEFT JOIN Properties p ON b.property_id = p.property_id
            LEFT JOIN entity_type ON p.entity_type_id = entity_type.entity_type_id
            LEFT JOIN locations l ON p.location_id = l.location_id
            LEFT JOIN clients ON p.client_id = clients.client_id
            WHERE cba.collector_id = ? AND b.entity_type = ? AND b.year = ? AND (p.tagged = 'Yes' AND ? = 'Yes' OR ? = 'No')
            ORDER BY l.location
            LIMIT ? OFFSET ?
        `, [collectorId, "Property", year, tagged,tagged, Number(limit), Number(offset)]);

        res.json({
            collector: collector[0],
            bills: assignedBills,
            pagination: {
                total,
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching collector details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getCollectorSignageSummary = async (req, res) => {
    const { collectorId, year, tagged } = req.params;
    const { page = 1, limit = 1000} = req.query;

    // Validate inputs
    if (!collectorId || isNaN(Number(collectorId))) {
        return res.status(400).json({ message: "Invalid collector ID" });
    }

    const offset = (page - 1) * limit;

    try {
        // Fetch collector details
        const [collector] = await db.query(
            "SELECT * FROM revenue_collector WHERE collector_id = ?",
            [collectorId]
        );

        if (!collector.length) {
            return res.status(404).json({ message: "Collector not found" });
        }


        // Count total bills (for pagination)
        const [totalBills] = await db.query(`
            SELECT COUNT(*) AS total FROM collector_bill_assignment cba
            LEFT JOIN bills b ON cba.bill_id = b.bill_id
            LEFT JOIN signage s ON b.signage_id = s.signage_id
            WHERE cba.collector_id = ? AND b.entity_type = ? AND b.year = ? AND (s.tagged = 'Yes' AND ? = 'Yes' OR ? = 'No')
        `, [collectorId, "Signage", year, tagged,tagged]);

        const total = totalBills[0]?.total || 0;

        // Fetch paginated and filtered bills
        const [assignedBills] = await db.query(`
           SELECT 	
                clients.firstname,
                clients.lastname,
                clients.contact,
                clients.client_id,
                s.signage_name,
                s.signage_id,
                entity_type.division,
                l.location AS Location,
                b.year,
                (b.total_amount + IFNULL(b.arrears, 0)) AS Bill_Amount
            FROM collector_bill_assignment cba
            LEFT JOIN bills b ON cba.bill_id = b.bill_id
            LEFT JOIN signage s ON b.signage_id = s.signage_id
            LEFT JOIN entity_type ON s.entity_type_id = entity_type.entity_type_id
            LEFT JOIN locations l ON s.location_id = l.location_id
            LEFT JOIN clients ON s.client_id = clients.client_id
            WHERE cba.collector_id = ? AND b.entity_type = ? AND b.year = ? AND (s.tagged = 'Yes' AND ? = 'Yes' OR ? = 'No')
            ORDER BY l.location
            LIMIT ? OFFSET ?
        `, [collectorId, "Signage", year, tagged,tagged, Number(limit), Number(offset)]);

        res.json({
            collector: collector[0],
            bills: assignedBills,
            pagination: {
                total,
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching collector details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
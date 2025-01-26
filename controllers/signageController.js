const db = require("../config/db");

exports.registerSignage = async (req, res) => {
    const { client_id, signage_name, digital_address, location_id, entity_type_id } = req.body;

    try {
        // Step 1: Get the location_code associated with the location_id
        const [locationResults] = await db.query(
            "SELECT location_code FROM locations WHERE location_id = ?",
            [location_id]
        );

        if (locationResults.length === 0) {
            return res.status(400).json({ error: "Invalid location_id. Location not found." });
        }

        const locationCode = locationResults[0].location_code;

        // Step 2: Get the latest signage_id for this location_code
        // The pattern is assumed to be "NAMA-S-<location_code>-<XXXX>"
        const [results] = await db.query(
            "SELECT signage_id FROM signage WHERE signage_id LIKE CONCAT('NAMA-S-', ?, '-%') ORDER BY id DESC LIMIT 1",
            [locationCode]
        );

        let newIncrement = 1;
        if (results.length > 0 && results[0].signage_id) {
            const lastSignageId = results[0].signage_id;
            // lastSignageId format: "NAMA-001-0001"
            const parts = lastSignageId.split('-');
            const lastIncrementStr = parts[3];  // e.g. "0001"
            const lastIncrementNum = parseInt(lastIncrementStr, 10);
            newIncrement = lastIncrementNum + 1;
        }

        // Step 3: Construct the new property_id
        const formattedIncrement = String(newIncrement).padStart(4, '0');
        const newSignageId = `NAMA-S-${locationCode}-${formattedIncrement}`;

        // Step 4: Insert the new property record
        await db.query(
            "INSERT INTO signage (client_id, signage_id, signage_name, digital_address, location_id, entity_type_id) VALUES (?, ?, ?, ?, ?, ?)",
            [client_id, newSignageId, signage_name, digital_address, location_id, entity_type_id]
        );

        res.status(200).json({ msg: "Success", signage_id: newSignageId });

    } catch (error) {
        console.error('Error creating signage:', error);
        res.status(500).send("Error creating signage");
    }
};


exports.updateSignage = async (req, res) => {
    const signageId = req.params.id;
    const { signage_name, digital_address, location_id, entity_type_id } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE signage SET signage_name = ?, digital_address = ?, location_id = ?, entity_type_id= ? WHERE id = ?',
            [signage_name, digital_address, location_id, entity_type_id, signageId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).send("Signage not found");
        }

        res.json({msg:"Signage updated successfully"});
    } catch (error) {
        console.error('Error updating signage:', error);
        res.status(500).send("Error updating signage");
    }
};

exports.deleteSignage = async (req, res) => {
    const signageId = req.params.id;
    try {

        const [result] = await db.query('DELETE FROM signage WHERE id = ?', [signageId]);

        if (result.affectedRows === 0) {
            return res.status(404).send("Signage not found");
        }

        res.json({msg:"Signage deleted successfully"});
    } catch (error) {
        console.error('Error deleting signage:', error);
        res.status(500).send("Error deleting signage");
    }
};

exports.showSignage = async (req, res) => {
    try {
        // Get the current page number from query params (default to 1)
        const currentPage = parseInt(req.query.page) || 1;

        // Define the number of items per page
        const itemsPerPage = 30;

        // Count the total number of signages
        const [totalCountResult] = await db.query("SELECT COUNT(*) AS total FROM signage");
        const totalItems = totalCountResult[0].total;

        // Calculate total pages
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        // Fetch properties for the current page
        const offset = (currentPage - 1) * itemsPerPage;
        const [signages] = await db.query(
            `SELECT *
            FROM signage
            LEFT JOIN locations ON signage.location_id = locations.location_id
            LEFT JOIN entity_type ON signage.entity_type_id = entity_type.entity_type_id
            LIMIT ? OFFSET ?`,
            [itemsPerPage, offset]
        );
        // Render the view and pass data
        res.render("signages", {
            signages,
            currentPage,
            totalPages,
        });
    } catch (error) {
        console.error("Error fetching signages:", error);
        res.status(500).json({ message: "An error occurred while fetching signages" });
    }
};

    exports.apiSignage = async (req, res) => {
        try {
            const searchQuery = req.query.search || ""; // Get the search query
            const page = parseInt(req.query.page, 10) || 1; // Get the current page, default to 1
            const limit = 30; // Number of results per page
            const offset = (page - 1) * limit;
    
            // Fetch matching properties with pagination
            const [signages] = await db.query(
                `SELECT * FROM signage 
                 LEFT JOIN locations ON signage.location_id = locations.location_id
                 LEFT JOIN entity_type ON signage.entity_type_id = entity_type.entity_type_id
                 WHERE signage_name LIKE ? OR digital_address LIKE ? OR client_id LIKE ? 
                 LIMIT ? OFFSET ?`,
                 [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, limit, offset]
            );
    
            // Fetch total number of matching properties for pagination
            const [countResult] = await db.query(
                `SELECT COUNT(*) AS count 
                FROM signage 
                WHERE signage_name LIKE ? OR digital_address LIKE ? OR client_id LIKE ?`,
                [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`]
            );
            const totalSignages = countResult[0].count;
            const totalPages = Math.ceil(totalSignages / limit);
    
            res.status(200).json({
                signages,
                currentPage: page,
                totalPages,
            });
        } catch (error) {
            console.error("Error searching signages:", error);
            res.status(500).json({ message: "An error occurred while searching for signages" });
        }
    };

    exports.getFeeFixing = async (req, res) => {
        
        const feeFixingId = req.params.id;

        try{
        const [categories] = await db.query(`SELECT * FROM fee_fixing WHERE fee_fixing_id = ?`, [feeFixingId])

        if (categories.affectedRows === 0) {
            return res.status(404).send("FeeFixing not found");
        }

        res.json({categories});
    }
    catch(error){
        console.error("Error",error)
    }
    }


    exports.getFeeFixingWithSignageType = async (req, res) => {
        
        const entity_type_id = req.params.id;

        try{
        const [categories] = await db.query(`SELECT * FROM fee_fixing WHERE entity_type_id = ?`, [entity_type_id])

        if (categories.affectedRows === 0) {
            return res.status(404).send("FeeFixing not found");
        }

        res.json({categories});
    }
    catch(error){
        console.error("Error",error)
    }
    }

    exports.getSignageWithFeeFixing = async(req, res) => {
        const {client_id, signage_id} = req.params;
        try{
            const query = `
                SELECT signage.signage_id, signage.signage_name, signage.digital_address, entity_type.entity_type_id, entity_type.division, fee_fixing.category, fee_fixing.amount, locations.location
                    FROM signage
                    LEFT JOIN entity_type ON signage.entity_type_id = entity_type.entity_type_id
                    LEFT JOIN fee_fixing ON signage.fee_fixing_id = fee_fixing.fee_fixing_id
                    LEFT JOIN locations ON signage.location_id = locations.location_id
                    WHERE client_id = ? AND signage_id= ?
            `
            const [signage] = await db.query(query, [client_id, signage_id])
           res.render("signageFeeFixing",{signage})
        }catch(error){
            console.error(error)
        }
    
    }

    exports.feeFixing = async (req, res) => {
        
        const signageId = req.params.id;
        const { fee_fixing_id } = req.body;
    
        try{
        const [result] = await db.query(`UPDATE signage SET fee_fixing_id = ? WHERE signage_id = ?`, [fee_fixing_id, signageId])

        if (result.affectedRows === 0) {
            return res.status(404).send("Signage not found");
        }

        res.json({msg:"Signage updated successfully"});
    }
    catch(error){
        console.error("Error",error)
    }
    }

    exports.updateTag =  async (req, res) => {
        const { signage_id, tagged } = req.body;
    
        if (!signage_id || !tagged) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
    
        try {
            // Example query: Update the "tagged" column for the specified client ID
            await db.query(
                'UPDATE signage SET tagged = ? WHERE signage_id = ?',
                [tagged, signage_id]
            );
            res.json({ success: true, message: 'Tag status updated successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Database update failed' });
        }
    };

    exports.resetTag =  async (req, res) => {
    
        try {
            await db.query(
                'UPDATE signage SET tagged = "No" WHERE tagged = "Yes"',
            );
            res.json({ success: true, message: 'Tag status updated successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Database update failed' });
        }
    };
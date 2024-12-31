const db = require("../config/db");

// exports.showRegistration = async (req, res) => {
//     try {
//         //const [feeFixings] = await db.query('SELECT fee_fixing_id, fee_type FROM fee_fixings');
//         const [businessTypes] = await db.query('SELECT business_type_id, business_type FROM business_types');
//         const [locations] = await db.query('SELECT location_id, location FROM locations');
//         console.log(businessTypes);
//         res.render("business_property_signage_registration", { businessTypes, locations });
//     } catch (error) {
//         console.error('Error fetching options:', error);
//         res.status(500).send('Server error');
//     }
// };

// exports.registerProperty = async (req, res) => {
//     const { client_id, house_number, digital_address, location_id, entity_type_id } = req.body;
//     console.log(req.body)
//     console.log({ client_id, house_number, digital_address, location_id, entity_type_id })
//     try {
//         // Step 1: Get the latest property_id
//         const [results] = await db.query("SELECT property_id FROM Properties ORDER BY id DESC LIMIT 1");
//         const lastPropertyId = results[0]?.property_id || "NAMA-P-0000";

//         // Step 2: Increment the numeric part of the property_id
//         const numericPart = parseInt(lastPropertyId.slice(7), 10) + 1;
//         const newPropertyId = `NAMA-P-${String(numericPart).padStart(4, '0')}`;

//         // Step 3: Insert the new property
//         await db.query(
//             "INSERT INTO Properties (client_id, property_id, house_number, digital_address, location_id, entity_type_id) VALUES (?, ?, ?, ?, ?, ?)",
//             [client_id, newPropertyId, house_number, digital_address, location_id, entity_type_id]
//         );
//         res.status(200).json({ msg: "Success" });


//     } catch (error) {
//         console.error('Error creating property:', error);
//         res.status(500).send("Error creating property");
//     }
// };
exports.registerProperty = async (req, res) => {
    const { client_id, house_number, digital_address, location_id, entity_type_id } = req.body;

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

        // Step 2: Get the latest property_id for this location_code
        // The pattern is assumed to be "NAMA-P-<location_code>-<XXXX>"
        const [results] = await db.query(
            "SELECT property_id FROM Properties WHERE property_id LIKE CONCAT('NAMA-P-', ?, '-%') ORDER BY id DESC LIMIT 1",
            [locationCode]
        );

        let newIncrement = 1;
        if (results.length > 0 && results[0].property_id) {
            const lastPropertyId = results[0].property_id;
            // lastPropertyId format: "NAMA-001-0001"
            const parts = lastPropertyId.split('-');
            const lastIncrementStr = parts[3];  // e.g. "0001"
            const lastIncrementNum = parseInt(lastIncrementStr, 10);
            newIncrement = lastIncrementNum + 1;
        }

        // Step 3: Construct the new property_id
        const formattedIncrement = String(newIncrement).padStart(4, '0');
        const newPropertyId = `NAMA-P-${locationCode}-${formattedIncrement}`;

        // Step 4: Insert the new property record
        await db.query(
            "INSERT INTO Properties (client_id, property_id, house_number, digital_address, location_id, entity_type_id) VALUES (?, ?, ?, ?, ?, ?)",
            [client_id, newPropertyId, house_number, digital_address, location_id, entity_type_id]
        );

        res.status(200).json({ msg: "Success", property_id: newPropertyId });

    } catch (error) {
        console.error('Error creating property:', error);
        res.status(500).send("Error creating property");
    }
};


exports.updateProperty = async (req, res) => {
    const propertyId = req.params.id;
    const { house_number, digital_address, location_id, entity_type_id } = req.body;
    console.log(propertyId)
    try {
        const [result] = await db.query(
            'UPDATE Properties SET house_number = ?, digital_address = ?, location_id = ?, entity_type_id= ? WHERE id = ?',
            [house_number, digital_address, location_id, entity_type_id, propertyId]
        );
        console.log(result)

        if (result.affectedRows === 0) {
            return res.status(404).send("Property not found");
        }

        res.json({msg:"Property updated successfully"});
    } catch (error) {
        console.error('Error updating property:', error);
        res.status(500).send("Error updating property");
    }
};

exports.deleteBusiness = async (req, res) => {
    const propertyId = req.params.id;
    try {

        const [result] = await db.query('DELETE FROM Properties WHERE id = ?', [propertyId]);

        if (result.affectedRows === 0) {
            return res.status(404).send("Property not found");
        }

        res.json({msg:"Property deleted successfully"});
    } catch (error) {
        console.error('Error deleting business:', error);
        res.status(500).send("Error deleting business");
    }
};

exports.showProperties = async (req, res) => {
    try {
        // Get the current page number from query params (default to 1)
        const currentPage = parseInt(req.query.page) || 1;

        // Define the number of items per page
        const itemsPerPage = 30;

        // Count the total number of businesses
        const [totalCountResult] = await db.query("SELECT COUNT(*) AS total FROM Properties");
        const totalItems = totalCountResult[0].total;

        // Calculate total pages
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        // Fetch properties for the current page
        const offset = (currentPage - 1) * itemsPerPage;
        const [properties] = await db.query(
            `SELECT *
            FROM Properties
            LEFT JOIN locations ON Properties.location_id = locations.location_id
            LEFT JOIN entity_type ON Properties.entity_type_id = entity_type.entity_type_id
            LIMIT ? OFFSET ?`,
            [itemsPerPage, offset]
        );
        // Render the view and pass data
        res.render("properties", {
            properties,
            currentPage,
            totalPages,
        });
    } catch (error) {
        console.error("Error fetching properties:", error);
        res.status(500).json({ message: "An error occurred while fetching properties" });
    }
};

    exports.apiProperty = async (req, res) => {
        try {
            const searchQuery = req.query.search || ""; // Get the search query
            const page = parseInt(req.query.page, 10) || 1; // Get the current page, default to 1
            const limit = 30; // Number of results per page
            const offset = (page - 1) * limit;
    
            // Fetch matching properties with pagination
            const [properties] = await db.query(
                `SELECT * FROM Properties 
                 LEFT JOIN locations ON Properties.location_id = locations.location_id
                 LEFT JOIN entity_type ON Properties.entity_type_id = entity_type.entity_type_id
                 WHERE house_number LIKE ? OR digital_address LIKE ? OR client_id LIKE ? 
                 LIMIT ? OFFSET ?`,
                 [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, limit, offset]
            );
    
            // Fetch total number of matching properties for pagination
            const [countResult] = await db.query(
                `SELECT COUNT(*) AS count 
                FROM Properties 
                WHERE house_number LIKE ? OR digital_address LIKE ? OR client_id LIKE ?`,
                [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`]
            );
            const totalProperties = countResult[0].count;
            const totalPages = Math.ceil(totalProperties / limit);
    
            res.status(200).json({
                properties,
                currentPage: page,
                totalPages,
            });
        } catch (error) {
            console.error("Error searching properties:", error);
            res.status(500).json({ message: "An error occurred while searching for properties" });
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


    exports.getFeeFixingWithPropertyType = async (req, res) => {
        
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

    exports.getPropertyWithFeeFixing = async(req, res) => {
        const {client_id, property_id} = req.params;
        try{
            const query = `
                SELECT Properties.property_id, Properties.house_number, Properties.digital_address, entity_type.entity_type_id, entity_type.division, fee_fixing.category, fee_fixing.amount, locations.location
                    FROM Properties
                    LEFT JOIN entity_type ON Properties.entity_type_id = entity_type.entity_type_id
                    LEFT JOIN fee_fixing ON Properties.fee_fixing_id = fee_fixing.fee_fixing_id
                    LEFT JOIN locations ON Properties.location_id = locations.location_id
                    WHERE client_id = ? AND property_id= ?
            `
            const [property] = await db.query(query, [client_id, property_id])
        
           res.render("propertyFeefixing",{property})
        }catch(error){
            console.error(error)
        }
    
    }

    exports.feeFixing = async (req, res) => {
        
        const propertyId = req.params.id;
        const { fee_fixing_id } = req.body;
    
        try{
        const [result] = await db.query(`UPDATE Properties SET fee_fixing_id = ? WHERE property_id = ?`, [fee_fixing_id, propertyId])

        if (result.affectedRows === 0) {
            return res.status(404).send("Property not found");
        }

        res.json({msg:"Business updated successfully"});
    }
    catch(error){
        console.error("Error",error)
    }
    }
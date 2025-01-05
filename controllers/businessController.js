const db = require("../config/db");

exports.showRegistration = async (req, res) => {
    try {
        //const [feeFixings] = await db.query('SELECT fee_fixing_id, fee_type FROM fee_fixings');
        const [businessTypes] = await db.query('SELECT business_type_id, business_type FROM business_types');
        const [locations] = await db.query('SELECT location_id, location FROM locations');
        console.log(businessTypes);
        res.render("business_property_signage_registration", { businessTypes, locations });
    } catch (error) {
        console.error('Error fetching options:', error);
        res.status(500).send('Server error');
    }
};

// exports.registerBusiness = async (req, res) => {
//     const { client_id, business_name, business_contact, business_activity, business_structure, business_size, entity_type_id, address, location_id, digital_address } = req.body;

//     try {
//         // Step 1: Get the latest business_id
//         const [results] = await db.query("SELECT business_id FROM businesses ORDER BY id DESC LIMIT 1");
//         const lastBusinessId = results[0]?.business_id || "NAMA-B-0000";

//         // Step 2: Increment the numeric part of the business_id
//         const numericPart = parseInt(lastBusinessId.slice(7), 10) + 1;
//         const newBusinessId = `NAMA-B-${String(numericPart).padStart(4, '0')}`;

//         // Step 3: Insert the new business
//         await db.query(
//             "INSERT INTO businesses (client_id, business_id, business_name, business_contact, business_activity, business_structure, business_size, entity_type_id, address, location_id, digital_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
//             [client_id, newBusinessId, business_name, business_contact, business_activity, business_structure, business_size, entity_type_id, address, location_id, digital_address]
//         );
//         res.send({msg: "Business registered successfully"})
//         //res.status(200).json({ redirectUrl: `/client/clientDetails/${client_id}` });


//     } catch (error) {
//         console.error('Error creating business:', error);
//         res.status(500).send("Error creating business");
//     }
// };
exports.registerBusiness = async (req, res) => {
    const {
        client_id,
        business_name,
        business_contact,
        business_activity,
        business_structure,
        business_size,
        entity_type_id,
        address,
        location_id,
        digital_address
    } = req.body;

    try {
        // Step 1: Get the location_code from the locations table
        const [locationResults] = await db.query(
            "SELECT location_code FROM locations WHERE location_id = ?",
            [location_id]
        );
        console.log(locationResults)
        if (locationResults.length === 0) {
            return res.status(400).send("Invalid location_id. Location not found.");
        }

        const locationCode = locationResults[0].location_code.toString().padStart(3, '0');

        // Step 2: Get the latest business_id for this location_code
        // We assume the format is always 'NAMA-<locationCode>-<XXXX>'
        const [results] = await db.query(
            "SELECT business_id FROM businesses WHERE business_id LIKE CONCAT('NAMA-B-', ?, '-%') ORDER BY id DESC LIMIT 1",
            [locationCode]
        );

        let newIncrement = 1; // default if no prior business_id found

        if (results.length > 0 && results[0].business_id) {
            const lastBusinessId = results[0].business_id;
            // lastBusinessId should look like 'NAMA-001-0001'
            // We can split by '-' and take the last part
            const parts = lastBusinessId.split('-');
            const lastIncrementStr = parts[3]; // e.g. "0001"
            const lastIncrementNum = parseInt(lastIncrementStr, 10);
            newIncrement = lastIncrementNum + 1;
        }

        // Step 3: Construct the new business_id
        const formattedIncrement = String(newIncrement).padStart(4, '0'); // zero-pad to 4 digits
        const newBusinessId = `NAMA-B-${locationCode}-${formattedIncrement}`;

        // Step 4: Insert the new business
        await db.query(
            "INSERT INTO businesses (client_id, business_id, business_name, business_contact, business_activity, business_structure, business_size, entity_type_id, address, location_id, digital_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                client_id,
                newBusinessId,
                business_name,
                business_contact,
                business_activity,
                business_structure,
                business_size,
                entity_type_id,
                address,
                location_id,
                digital_address
            ]
        );

        res.send({ msg: "Business registered successfully" });

    } catch (error) {
        console.error('Error creating business:', error);
        res.status(500).send("Error creating business");
    }
};

exports.updateBusiness = async (req, res) => {
    const businessId = req.params.id;
    const { business_name, business_contact, business_activity, business_structure, business_size, entity_type_id, address, location_id, digital_address } = req.body;

    try {
        const [result] = await db.query(
            'UPDATE businesses SET business_name = ?, business_contact = ?, business_activity = ?, business_structure = ?, business_size = ?, entity_type_id = ?, address = ?, location_id = ?, digital_address = ? WHERE id = ?',
            [business_name, business_contact, business_activity, business_structure, business_size, entity_type_id, address, location_id, digital_address, businessId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).send("Business not found");
        }

        res.json({msg:"Business updated successfully"});
    } catch (error) {
        console.error('Error updating business:', error);
        res.status(500).send("Error updating business");
    }
};

exports.deleteBusiness = async (req, res) => {
    const businessId = req.params.id;
    try {
        const [result] = await db.query('DELETE FROM businesses WHERE id = ?', [businessId]);

        if (result.affectedRows === 0) {
            return res.status(404).send("Business not found");
        }

        res.status(200).send("Business deleted successfully");
    } catch (error) {
        console.error('Error deleting business:', error);
        res.status(500).send("Error deleting business");
    }
};

exports.showBusinesses = async (req, res) => {
    try {
        // Get the current page number from query params (default to 1)
        const currentPage = parseInt(req.query.page) || 1;

        // Define the number of items per page
        const itemsPerPage = 10;

        // Count the total number of businesses
        const [totalCountResult] = await db.query("SELECT COUNT(*) AS total FROM businesses");
        const totalItems = totalCountResult[0].total;

        // Calculate total pages
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        // Fetch businesses for the current page
        const offset = (currentPage - 1) * itemsPerPage;
        const [businesses] = await db.query(
            `SELECT *
            FROM businesses
            LEFT JOIN locations ON businesses.location_id = locations.location_id
            LEFT JOIN entity_type ON businesses.entity_type_id = entity_type.entity_type_id
            LIMIT ? OFFSET ?`,
            [itemsPerPage, offset]
        );
        // Render the view and pass data
        res.render("businesses", {
            businesses,
            currentPage,
            totalPages,
        });
    } catch (error) {
        console.error("Error fetching businesses:", error);
        res.status(500).json({ message: "An error occurred while fetching businesses" });
    }
};

    exports.apiBusiness = async (req, res) => {
        try {
            const searchQuery = req.query.search || ""; // Get the search query
            const page = parseInt(req.query.page, 10) || 1; // Get the current page, default to 1
            const limit = 30; // Number of results per page
            const offset = (page - 1) * limit;
    
            // Fetch matching businesses with pagination
            const [businesses] = await db.query(
              `SELECT * FROM businesses
                LEFT JOIN locations ON businesses.location_id = locations.location_id
                 LEFT JOIN entity_type ON businesses.entity_type_id = entity_type.entity_type_id
                WHERE business_name LIKE ? OR business_contact LIKE ? OR client_id LIKE ? 
                LIMIT ? OFFSET ?`,
                [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, limit, offset]
            );
    
            // Fetch total number of matching businesses for pagination
            const [countResult] = await db.query(
                `SELECT COUNT(*) AS count 
                FROM businesses 
                WHERE business_name LIKE ? OR business_contact LIKE ? OR client_id LIKE ?`,
                [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`]
            );
            const totalBusinesses = countResult[0].count;
            const totalPages = Math.ceil(totalBusinesses / limit);
    
            res.status(200).json({
                businesses,
                currentPage: page,
                totalPages,
            });
        } catch (error) {
            console.error("Error searching businesses:", error);
            res.status(500).json({ message: "An error occurred while searching for businesses" });
        }
    };
    
    exports.feeFixing = async (req, res) => {
        
        const businessId = req.params.id;
        const { fee_fixing_id } = req.body;
    
        try{
        const [result] = await db.query(`UPDATE businesses SET fee_fixing_id = ? WHERE business_id = ?`, [fee_fixing_id, businessId])

        if (result.affectedRows === 0) {
            return res.status(404).send("Business not found");
        }

        res.json({msg:"Business updated successfully"});
    }
    catch(error){
        console.error("Error",error)
    }
    }

    exports.getFeeFixing = async (req, res) => {
        
        const feeFixingId = req.params.id;

        try{
        const [categories] = await db.query(`SELECT * FROM business_fee_fixings WHERE business_fee_fixing_id = ?`, [feeFixingId])

        if (categories.affectedRows === 0) {
            return res.status(404).send("FeeFixing not found");
        }

        res.json({categories});
    }
    catch(error){
        console.error("Error",error)
    }
    }

    exports.getBusinessWithFeeFixing = async(req, res) => {
        const {client_id, business_id}  = req.params;
        try{
            const query = `
                SELECT businesses.business_id, businesses.business_name, businesses.business_contact, businesses.business_activity, businesses.business_structure, businesses.business_size, entity_type.entity_type_id, entity_type.division, fee_fixing.category, fee_fixing.amount, locations.location
                    FROM businesses
                    LEFT JOIN entity_type ON businesses.entity_type_id = entity_type.entity_type_id
                    LEFT JOIN fee_fixing ON businesses.fee_fixing_id = fee_fixing.fee_fixing_id
                    LEFT JOIN locations ON businesses.location_id = locations.location_id
                    WHERE client_id = ? AND business_id = ?
            `
            const [business] = await db.query(query, [client_id, business_id])
    
           res.render("businessFeefixing",{business})
        }catch(error){
            console.error(error)
        }
    
    }

    exports.getFeeFixingWithBusinessType = async (req, res) => {
        
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

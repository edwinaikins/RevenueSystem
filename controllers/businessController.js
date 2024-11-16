const db = require("../config/db");

exports.showRegistration = async (req, res) => {
    try {
        const [feeFixings] = await db.query('SELECT fee_fixing_id, fee_type FROM fee_fixings');
        const [businessTypes] = await db.query('SELECT business_type_id, business_type FROM business_types');
        const [locations] = await db.query('SELECT location_id, location FROM locations');
        res.render("business_property_signage_registration", { feeFixings, businessTypes, locations });
    } catch (error) {
        console.error('Error fetching options:', error);
        res.status(500).send('Server error');
    }
};

exports.registerBusiness = async (req, res) => {
    const { client_id, fee_fixing_id, business_name, business_contact, business_activity, business_structure, business_size, business_type_id, address, location_id, digital_address } = req.body;

    try {
        // Step 1: Get the latest business_id
        const [results] = await db.query("SELECT business_id FROM businesses ORDER BY id DESC LIMIT 1");
        const lastBusinessId = results[0]?.business_id || "NAMA-B-0000";

        // Step 2: Increment the numeric part of the business_id
        const numericPart = parseInt(lastBusinessId.slice(7), 10) + 1;
        const newBusinessId = `NAMA-B-${String(numericPart).padStart(4, '0')}`;

        // Step 3: Insert the new business
        await db.query(
            "INSERT INTO businesses (client_id, business_id, fee_fixing_id, business_name, business_contact, business_activity, business_structure, business_size, business_type_id, address, location_id, digital_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [client_id, newBusinessId, fee_fixing_id, business_name, business_contact, business_activity, business_structure, business_size, business_type_id, address, location_id, digital_address]
        );

        res.status(200).send("Business Created Successfully");
    } catch (error) {
        console.error('Error creating business:', error);
        res.status(500).send("Error creating business");
    }
};

exports.updateBusiness = async (req, res) => {
    const businessId = req.params.id;
    const { fee_fixing_id, business_name, business_contact, business_activity, business_structure, business_size, business_type_id, address, location_id, digital_address } = req.body;

    try {
        const [result] = await db.query(
            'UPDATE businesses SET fee_fixing_id = ?, business_name = ?, business_contact = ?, business_activity = ?, business_structure = ?, business_size = ?, business_type_id = ?, address = ?, location_id = ?, digital_address = ? WHERE id = ?',
            [fee_fixing_id, business_name, business_contact, business_activity, business_structure, business_size, business_type_id, address, location_id, digital_address, businessId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).send("Business not found");
        }

        res.status(200).send("Business updated successfully");
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

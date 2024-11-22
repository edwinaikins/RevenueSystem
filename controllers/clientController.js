const db = require("../config/db");

exports.showClientsRegistration = (req, res) => {
    res.render("clients");
};
exports.showClients = (req, res) => {
    res.render("allclients");
};

exports.registerClient = async (req, res) => {
    const { firstname, lastname, contact, email, address } = req.body;

    try {
        // Step 1: Get the latest client_id
        const [results] = await db.query("SELECT client_id FROM clients ORDER BY id DESC LIMIT 1");
        const lastClientId = results[0]?.client_id || "NAMA0000";

        // Step 2: Increment the numeric part of the client_id
        const numericPart = parseInt(lastClientId.slice(4), 10) + 1;
        const newClientId = `NAMA${String(numericPart).padStart(4, '0')}`; // e.g., NAMA0001, NAMA0002, etc.

        // Step 3: Insert the new client with the generated client_id
        await db.query(
            "INSERT INTO clients (client_id, firstname, lastname, contact, email, address) VALUES (?, ?, ?, ?, ?, ?)",
            [newClientId, firstname, lastname, contact, email, address]
        );

        res.redirect(`/client/clientDetails/${newClientId}`);
    } catch (err) {
        console.error('Error creating client:', err);
        res.status(500).send("Error creating client");
    }
};

exports.updateClient = async (req, res) => {
    const clientId = req.params.id;
    const { firstname, lastname, contact, email, address } = req.body;

    try {
        const [result] = await db.query(
            'UPDATE clients SET firstname = ?, lastname = ?, contact = ?, email = ?, address = ? WHERE id = ?',
            [firstname, lastname, contact, email, address, clientId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).send("Client not found");
        }

        res.redirect('/client/getAll');
    } catch (err) {
        console.error('Error updating client:', err);
        res.status(500).send("Error updating client");
    }
};

exports.deleteClient = async (req, res) => {
    const clientId = req.params.id;

    try {
        const [result] = await db.query('DELETE FROM clients WHERE id = ?', [clientId]);

        if (result.affectedRows === 0) {
            return res.status(404).send("Client not found");
        }
        req.flash('success', 'Client deleted successfully');
        res.redirect('/client/getAll');
        //res.render("allclients",{msg: "Deleted Successfully"})
    } catch (err) {
        console.error('Error deleting client:', err);
        req.flash('error', 'An error occurred while deleting the client');
        res.redirect('/client/getall');
    }
};

exports.showAllClients = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Get the page number from the query, default to 1
    const limit = 30; // Number of entries per page
    const offset = (page - 1) * limit;

    try {
        // Fetch a limited set of clients based on the current page
        const [clients] = await db.query('SELECT * FROM clients LIMIT ? OFFSET ?', [limit, offset]);

        // Fetch total number of clients for pagination
        const [countResult] = await db.query('SELECT COUNT(*) AS count FROM clients');
        const totalClients = countResult[0].count;
        const totalPages = Math.ceil(totalClients / limit);
       
        res.render('allclients', {
            clients,
            currentPage: page,
            totalPages,
        });
    } catch (err) {
        console.error('Error fetching clients:', err);
        res.status(500).send("Error fetching clients");
    }
};

// Route to fetch client details and registrations
exports.getClientDetails = async (req, res) => {
    const { id } = req.params;

    try {
        // Fetch client details
        const [client] = await db.query("SELECT * FROM clients WHERE client_id = ?", [id]);

        if (!client.length) {
            return res.status(404).json({ error: "Client not found" });
        }

        // Fetch associated businesses
        const [businesses] = await db.query(`
            SELECT 
                businesses.*, 
                locations.location,
                business_types.business_type
            FROM businesses
            LEFT JOIN locations ON businesses.location_id = locations.location_id
            LEFT JOIN business_types ON businesses.business_type_id = business_types.business_type_id
            WHERE businesses.client_id = ?
        `, [id]);
        

        // Fetch associated properties
        const [properties] = await db.query(`
            SELECT
            Properties.*, 
            locations.location,
            property_types.property_type
            FROM Properties 
            LEFT JOIN locations ON Properties.location_id = locations.location_id
            LEFT JOIN property_types ON Properties.property_type_id = property_types.property_type_id
            WHERE Properties.client_id = ?`, [id]);

        // Fetch business types
        const [businessTypes] = await db.query('SELECT * FROM business_types');

        const [property_types] = await db.query('SELECT * FROM property_types')

        const [locations] = await db.query('SELECT * FROM locations');

        // Fetch associated signage
        //const [signages] = await db.query("SELECT * FROM signages WHERE client_id = ?", [clientId]);

        // Respond with all data
        
        res.render("oneClientDetails",{
            layout: false, 
            pageTitle: 'Portal',
            client: client[0],
            businesses,
            properties,
            businessTypes,
            property_types,
            locations
        })
        
    } catch (err) {
        console.error('Error fetching client details:', err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
};

exports.searchClients = async (req, res) => {
    try {
        const searchQuery = req.query.q || ""; // Get the search query
        const page = parseInt(req.query.page) || 1; // Get the current page, default to 1
        const limit = 30; // Number of results per page
        const offset = (page - 1) * limit;

        // Fetch matching clients with pagination
        const [clients] = await db.query(
            `SELECT * FROM clients 
            WHERE firstname LIKE ? OR lastname LIKE ? OR contact LIKE ? OR email LIKE ? 
            LIMIT ? OFFSET ?`,
            [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, limit, offset]
        );

        // Fetch total number of matching clients for pagination
        const [countResult] = await db.query(
            `SELECT COUNT(*) AS count 
            FROM clients 
            WHERE firstname LIKE ? OR lastname LIKE ? OR contact LIKE ? OR email LIKE ?`,
            [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`]
        );
        const totalClients = countResult[0].count;
        const totalPages = Math.ceil(totalClients / limit);

        res.status(200).json({
            clients,
            currentPage: page,
            totalPages,
        });
    } catch (error) {
        console.error("Error searching clients:", error);
        res.status(500).json({ message: "An error occurred while searching for clients" });
    }
};


exports.getAllClients = async (req, res) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1); // Default to 1 and ensure it's positive
    const limit = parseInt(req.query.limit) || 30; // Default to 30 if not provided
    const offset = (page - 1) * limit;

    try {
        // Fetch a limited set of clients based on the current page
        const [clients] = await db.query('SELECT * FROM clients LIMIT ? OFFSET ?', [limit, offset]);

        // Fetch total number of clients for pagination
        const [countResult] = await db.query('SELECT COUNT(*) AS count FROM clients');
        const totalClients = countResult[0].count;
        const totalPages = Math.ceil(totalClients / limit);

        res.status(200).json({
            clients,
            currentPage: page,
            totalPages,
        });
    } catch (error) {
        console.error("Error fetching all clients:", error);
        res.status(500).json({ message: "An error occurred while fetching clients" });
    }
};


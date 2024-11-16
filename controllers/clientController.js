const db = require("../config/db");

exports.showClientsRegistration = (req, res) => {
    res.render("clients");
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

        res.status(200).send("Client Created Successfully");
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

        res.redirect('/client/getAll');
    } catch (err) {
        console.error('Error deleting client:', err);
        res.status(500).send("Error deleting client");
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
            totalPages
        });
    } catch (err) {
        console.error('Error fetching clients:', err);
        res.status(500).send("Error fetching clients");
    }
};

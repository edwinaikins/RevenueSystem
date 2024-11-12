// const db = require("../config/db")


// exports.showClientsRegistration = (req,res) => {
//     res.render("clients")
// }

// exports.registerClient = async(req, res) => {
//     const { firstname, lastname, contact, email, address } = req.body;
//     try{
//         db.query("INSERT INTO clients (firstname, lastname, contact, email, address) VALUES (?, ?, ?, ?, ?)", [firstname, lastname, contact, email, address], (err, results) =>{
//             if(err){
//                 throw err;
//             }
//             res.status(200).send("Client Created Succesfully")
//         })
//     }
//     catch(err){
//         console.error(err);
//         res.status(500).send('Error creating client');
//     }
//   }

const db = require("../config/db");

exports.showClientsRegistration = (req, res) => {
    res.render("clients");
};

exports.registerClient = async (req, res) => {
    const { firstname, lastname, contact, email, address } = req.body;

    try {
        // Step 1: Get the latest client_id
        db.query("SELECT client_id FROM clients ORDER BY id DESC LIMIT 1", (err, results) => {
            if (err) {
                throw err;
            }

            // Extract the last client_id or set a default value if no clients exist
            const lastClientId = results[0]?.client_id || "NAMA0000";

            // Step 2: Increment the numeric part of the client_id
            const numericPart = parseInt(lastClientId.slice(4), 10) + 1;
            const newClientId = `NAMA${String(numericPart).padStart(4, '0')}`; // e.g., NAMA0001, NAMA0002, etc.

            // Step 3: Insert the new client with the generated client_id
            db.query(
                "INSERT INTO clients (client_id, firstname, lastname, contact, email, address) VALUES (?, ?, ?, ?, ?, ?)",
                [newClientId, firstname, lastname, contact, email, address],
                (err, results) => {
                    if (err) {
                        throw err;
                    }
                    res.status(200).send("Client Created Successfully");
                }
            );
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error creating client");
    }
};

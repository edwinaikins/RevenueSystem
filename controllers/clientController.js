const db = require("../config/db")


exports.showClientsRegistration = (req,res) => {
    res.render("clients")
}

exports.registerClient = async(req, res) => {
    const { firstname, lastname, contact, email, address } = req.body;
    try{
        db.query("INSERT INTO clients (firstname, lastname, contact, email, address) VALUES (?, ?, ?, ?, ?)", [firstname, lastname, contact, email, address], (err, results) =>{
            if(err){
                throw err;
            }
            res.status(200).send("Client Created Succesfully")
        })
    }
    catch(err){
        console.error(err);
        res.status(500).send('Error creating client');
    }
  }
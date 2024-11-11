const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");

router.get("/register", clientController.showClientsRegistration)
router.post("/register", clientController.registerClient)

module.exports = router;
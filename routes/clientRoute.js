const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");

router.get("/register", clientController.showClientsRegistration);
router.post("/register", clientController.registerClient);
router.get("/getAll", clientController.showAllClients);
router.get("/all", clientController.getAllClients)
router.get("/delete/:id", clientController.deleteClient);
router.post("/update/:id", clientController.updateClient);
router.get("/clientDetails/:id", clientController.getClientDetails)
router.get('/search', clientController.searchClients);
router.get("/showClients", clientController.showClients)

module.exports = router;
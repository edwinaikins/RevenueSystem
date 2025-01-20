const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");
const ensureAuthenticated = require("../middleware/authMiddleware");

router.get("/register", ensureAuthenticated,clientController.showClientsRegistration);
router.post("/register",ensureAuthenticated, clientController.registerClient);
router.get("/getAll",ensureAuthenticated, clientController.showAllClients);
router.get("/all",ensureAuthenticated, clientController.getAllClients)
router.get("/delete/:id",ensureAuthenticated, clientController.deleteClient);
router.post("/update/:id",ensureAuthenticated, clientController.updateClient);
router.get("/clientDetails/:id",ensureAuthenticated, clientController.getClientDetails)
router.get('/search',ensureAuthenticated, clientController.searchClients);
router.get("/showClients",ensureAuthenticated, clientController.showClients);

module.exports = router;
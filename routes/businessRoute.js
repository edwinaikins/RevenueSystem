const express = require("express");
const router = express.Router();
const businessController = require("../controllers/businessController");

router.post("/register", businessController.registerBusiness);
router.post("/update/:id", businessController.updateBusiness);
router.get("/delete/:id", businessController.deleteBusiness);
router.get("/register", businessController.showRegistration);

module.exports = router;
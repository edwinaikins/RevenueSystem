const express = require("express");
const router = express.Router();
const businessController = require("../controllers/businessController");

router.post("/register", businessController.registerBusiness);
router.put("/update/:id", businessController.updateBusiness);
router.delete("/delete/:id", businessController.deleteBusiness);
router.get("/register", businessController.showRegistration);
router.get("/showBusinesses", businessController.showBusinesses)
router.get("/api/businesses", businessController.apiBusiness)


module.exports = router;
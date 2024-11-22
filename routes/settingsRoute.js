const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");

router.get("/", settingsController.showSettingsPage)
router.post("/addBusinessType", settingsController.addBusinessType);
router.post("/addPropertyType", settingsController.addPropertyType)
router.post("/addLocation", settingsController.addLocation)
router.post("/addFeeFixing", settingsController.addFeefixing)

module.exports = router;
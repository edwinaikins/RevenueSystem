const { Router } = require("express");
const router = Router();
const ensureAuthenticated = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

router.get("/dashboard", ensureAuthenticated , userController.getDashboard);
router.get("/login", userController.showLoginPage);
router.post("/register", userController.registerUser);
router.post("/login", userController.authUser);
router.get("/logout", userController.logout);


module.exports = router;
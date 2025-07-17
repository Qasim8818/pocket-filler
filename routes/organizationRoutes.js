const express = require("express");
const router = express.Router();
const organizationController = require("../controllers/organizationController");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.post("/signup", organizationController.organizationSignup);
router.post("/login", organizationController.organizationLogin);
router.post("/verify-signup-code", organizationController.verifySignupCode);
router.get("/profile", authMiddleware, organizationController.getProfile);

module.exports = router;

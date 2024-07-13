const express = require("express");
const router = express.Router();
const fresherController= require("../controller/fresherController");
const jwt = require("jsonwebtoken");

router.post("/submit-details",fresherController.getDetails);
router.get("/allocated-details",fresherController.showDetails);


module.exports = router;
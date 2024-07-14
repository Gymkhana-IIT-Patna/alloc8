import express from "express";
import fresherController from "../controller/fresherController.js"
const router = express.Router();


router.post("/submit-details",fresherController.getDetails);
router.get("/allocated-details",fresherController.showDetails);


export default router;
import express from "express";
import nonfresherController from "../controller/nonfresherController.js"
const router = express.Router();

//if allocated then get this and show to client 
router.get("/allocated-details",nonfresherController.showDetails);
//apis needed
// - get the detail of the hostel one is eligible for , the live real time status of the rooms vacancy 
// -  post self willingness choice of the hostel 

router.get('/room-status',nonfresherController.getRoom);
router.post('/room-booking',nonfresherController.roomBooking);

export default router;
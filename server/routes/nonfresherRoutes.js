import express from "express";
import nonfresherController from "../controller/nonfresherController.js";
const router = express.Router();
import jwt from "jsonwebtoken";

router.use(async (req, res, next) => {
  const token = req.get("X-Alloc8-IDToken");
  if (token == undefined) {
    res.sendStatus(401);
  }

  const keys = req.app.locals.keys;
  const pems = req.app.locals.pems;
  const kid = jwt.decode(token, { complete: true }).header.kid;
  let i;
  for (i = 0; i < keys.length; i++) {
    if (keys[i].kid == kid) break;
  }
  try {
    req.auth = jwt.verify(token, pems[i], {
      algorithms: "RS256",
      /* TODO: add these to config.json - pranjal */
      audience: "a9a14467-3eb9-4499-9c63-e7fd24d90985",
      issuer:
        "https://login.microsoftonline.com/a57f7d92-038e-4d4c-8265-7cd2beb33b34/v2.0",
    });

    switch (req._parsedUrl.pathname) {
      case "/allocated-details":
        nonfresherController.showDetails(req, res);
        break;
      case "/room-status":
        nonfresherController.getRoom(req, res);
        break;
      case "/room-booking":
        nonfresherController.roomBooking(req, res);
        break;
      default:
        console.error("Unknown Route");
        res.sendStatus(404);
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(401);
  }
});

//if allocated then get this and show to client
router.get("/allocated-details", nonfresherController.showDetails);
//apis needed
// - get the detail of the hostel one is eligible for , the live real time status of the rooms vacancy
// -  post self willingness choice of the hostel

router.post("/room-status", nonfresherController.getRoom);
router.post("/room-booking", nonfresherController.roomBooking);

export default router;

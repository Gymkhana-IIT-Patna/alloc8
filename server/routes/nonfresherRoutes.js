import express from "express";
import nonfresherController from "../controller/nonfresherController.js";
const router = express.Router();
import jwt from "jsonwebtoken";

router.use(async (req, res, next) => {
  const token = req.get("X-Alloc8-IDToken");
  if (token == undefined) {
    res.sendStatus(401);
    return;
  }

  const keys = req.app.locals.keys;
  const pems = req.app.locals.pems;
  const myjwt = jwt.decode(token, { complete: true })
  if (myjwt == null) {
    res.sendStatus(401);
  }
  const kid = myjwt.header.kid;
  let i;
  for (i = 0; i < keys.length; i++) {
    if (keys[i].kid == kid) break;
  }
  try {
    req.auth = jwt.verify(token, pems[i], {
      algorithms: "RS256",
      /* TODO: add these to config.json - pranjal */
      audience: "35a0637a-3118-4cc3-9180-30f6beae3a5d",
      issuer:
        "https://login.microsoftonline.com/a57f7d92-038e-4d4c-8265-7cd2beb33b34/v2.0",
    });

    let email = req.auth.preferred_username;
    console.log(email)
    let firstname_roll = email.split("@")[0];
    let parts = firstname_roll.split("_");
    for (let part of parts) {
      if (part.startsWith("24")) {
        console.error("Fresher trying to allocate non fresher room");
        res.sendStatus(401);
      }
    }
    next();
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
/* vi: set et sw=2: */

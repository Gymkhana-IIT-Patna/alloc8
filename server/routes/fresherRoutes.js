import express from "express";
import fresherController from "../controller/fresherController.js"
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
            issuer: "https://login.microsoftonline.com/a57f7d92-038e-4d4c-8265-7cd2beb33b34/v2.0",
        });
        let email = req.auth.preferred_username;
        let firstname_roll = email.split("@")[0];
        let parts = firstname_roll.split("_");
        for (let part of parts) {
          if (part.startsWith("2421")) {
            console.error("PhD24 trying to allocate fresher room");
            res.sendStatus(401);
            return;
          } else if (part.startsWith("24")) {
            next();
          }
        }
        console.error("Non fresher trying to allocate fresher room");
        res.sendStatus(401);
    } catch (e) {
        console.error(e);
        res.sendStatus(401);
    }
});

router.post("/submit-details",fresherController.getDetails);
router.get("/allocated-details",fresherController.showDetails);


export default router;
/* vi: set et sw=2: */

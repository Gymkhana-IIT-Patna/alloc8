import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function getRollNumber(preferred_username) {
  const mailParts = preferred_username.split("@")[0].split("_");
  if (mailParts[0] == "1821me16" || mailParts[0] == "1821ph11" || mailParts[0] == "1821me11") {
    return mailParts[0];
  }
  if (mailParts.length != 2) {
    console.error("Invalid mail", preferred_username);
    return null;
  }
  if (mailParts[0].startsWith("2") || mailParts[0].startsWith("1")) return mailParts[0];
  else if (mailParts[1].startsWith("2") || mailParts[1].startsWith("1")) return mailParts[1];
  else {
    console.error("Invalid mail", preferred_username);
    return null;
  }
}

async function getDetails(req, res) {
  const rollnum = getRollNumber(req.auth.preferred_username);
  let {
    branch,
    placeOfLiving,
    motherTongue,
    sportsHobbies,
    techHobbies,
    culturalHobbies,
    nature,
    futureInterests,
    cpi,
    remarks
  } = req.body;
  console.log(req.body);
  try {
    let arrayMotherTongue = [];
    for (let i of motherTongue) {
      arrayMotherTongue.push(i.value);
    }
    motherTongue = arrayMotherTongue;
    // added to db
    const detailExists = await prisma.smpDetails.findUnique({
      where: {
        rollnum,
      },
    });
    if (detailExists != null) {
      console.error(rollnum, " tried to submit again");
      res.status(500).json({ error: "You have already submitted the form" });
      return;
    }
    const smpDetail = await prisma.smpDetails.create({
      data: {
        rollnum,
        branch,
        placeOfLiving,
        motherTongue,
        sportsHobbies,
        techHobbies,
        culturalHobbies,
        nature,
        futureInterests,
        cpi,
        remarks
      },
    });

    res.status(201).json({
      message:
        "Your Details have been saved !",
      smpDetail,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
async function resetDetails(req, res) {
  const rollnum = getRollNumber(req.auth.preferred_username);
  try {
    // added to db
    const smpDetail = await prisma.smpDetails.delete({
      where: {
        rollnum,
      },
    });
    res.status(200).json({
      message:
        "Your Details have been deleted !",
      smpDetail,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

async function checkStud(req, res) {
  const rollnum = getRollNumber(req.auth.preferred_username);
  try {
    const student = await prisma.smpDetails.findUnique({
      where: { rollnum },
    });

    if (student) {
      return res.status(200).json({
        exists: true,
      });
    } else {
      return res.status(200).json({
        exists: false,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}


async function submitDetails(req, res) {
  const rollnum = getRollNumber(req.auth.preferred_username);
  const token = req.headers['X-Alloc8-IDToken']
  const body = req.body;
  const name = req.auth.name
  console.log(body)
  try {
    //TODO: prisma create
    //TODO: verify token 
    const student = await prisma.smpDetails.findUnique({
      where: { rollnum: rollnum },
    });

    const yearPrefix = rollnum.substring(0, 2);  // e.g. "24"

    if (yearPrefix !== "25" && yearPrefix !== "24") {
      return res.status(401).json({
        error: "Only 1st and 2nd Year Students can fill this form.",
      });
    }

    if (student) {
      return res.status(400).json({
        error: "You have already submitted!",
      });
    }
    const smpDetail = await prisma.smpDetails.create({
      data: {
        ...body,
        rollnum,
        name

      },
    });
    res.status(200).json({
      message:
        "Your Details have been submitted!",
      smpDetail,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

async function getCluster(req, res) {
  const rollnum = getRollNumber(req.auth.preferred_username);

  function normalizeRoll(r) {
    if (r === null || r === undefined) return "";
    return String(r).trim().toLowerCase();
  }

  try {
    const clustersPath = path.resolve(__dirname, "../data/clusters.json");
    const raw = await fs.readFile(clustersPath, "utf8");
    const parsed = JSON.parse(raw);

    const targetRoll = normalizeRoll(rollnum);
    if (!targetRoll) {
      return res.status(400).json({ error: "Could not determine roll number from auth info." });
    }

    console.log(`Fetching Cluster for ${targetRoll}`)
    const clusterHasRoll = (clusterObj) => {
      if (!clusterObj || !Array.isArray(clusterObj.members)) return false;
      return clusterObj.members.some((m) => normalizeRoll(m.roll) === targetRoll);
    };

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      for (const [clusterId, clusterObj] of Object.entries(parsed)) {
        if (clusterHasRoll(clusterObj)) {
          return res.status(200).json({
            found: true,
            clusterId,
            cluster: clusterObj,
          });
        }
      }
    }

    // not found
    return res.status(404).json({
      found: false,
      message: `No cluster found containing roll ${rollnum}`,
    });
  } catch (err) {
    console.error("getCluster error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}

export default { submitDetails, getDetails, resetDetails, checkStud, getCluster};
/* vi: set et sw=2: */

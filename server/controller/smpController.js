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
    languagesSpoken,
    sportsHobbies,
    techHobbies,
    culturalHobbies,
    nature,
    futureInterests,
  } = req.body;
  console.log(req.body);
  try {
    let arrayMotherTongue = [];
    for (let i of motherTongue) {
      arrayMotherTongue.push(i.value);
    }
    motherTongue = arrayMotherTongue;
    // added to db
    const smpDetail = await prisma.smpDetails.create({
      data: {
        rollnum,
        branch,
        placeOfLiving,
        languagesSpoken,
        sportsHobbies,
        techHobbies,
        culturalHobbies,
        nature,
        futureInterests,
      },
    });

    res.status(201).json({
      message:
        "Your Details have been saved !",
      smpDetail,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}
export default { getDetails };
/* vi: set et sw=2: */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function getDetails(req, res) {
  let {
    rollnum,
    motherTongue,
    placeOfLiving,
    branch,
    sportsHobbies,
    techHobbies,
    culturalHobbies,
    nature,
    futureInterests,
    sleep,
  } = req.body;
  console.log(req.body);
  try {
    const student = await prisma.students.findUnique({
      where: { rollnum },
    });

    if (student && student.allocated) {
      return res
        .status(400)
        .json({ error: "Hostel already allotted to this student." });
    }

    let arrayMotherTongue = [];
    for (let i of motherTongue) {
      arrayMotherTongue.push(i.value);
    }
    motherTongue = arrayMotherTongue;
    // added to db
    const fresherDetail = await prisma.fresherDetails.create({
      data: {
        rollnum,
        motherTongue,
        placeOfLiving,
        branch,
        sportsHobbies,
        techHobbies,
        culturalHobbies,
        nature,
        futureInterests,
        sleep,
      },
    });

    res.status(201).json({
      message:
        "Your Details have been saved ! Kindly check after 20/07 10.00 to view your alloted room",
      fresherDetail,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}

async function showDetails(req, res) {
  const { rollnum } = req.query;
  try {
    const student = await prisma.students.findUnique({
      where: { rollnum },
    });

    if (student && student.allocated) {
      const roommates = await prisma.students.findMany({
        where: {
          hostel: student.hostel,
          roomnum: student.roomnum,
        },
        select: {
          rollnum: true,

          name: true,
        },
      });

      return res.status(200).json({
        hostel: student.hostel,
        roomNum: student.roomnum,
        room: student.room,
        occupancy: student.occupancy,
        roommates,
      });
    } else {
      res.status(400).json({ error: "kindly wait for allocation !" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export default { getDetails, showDetails };

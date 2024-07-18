import Redis from "ioredis";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const redis = new Redis();
//const crypto= require('crypto');
import crypto from "crypto";
const codeExpiryDelta = 10 * 60000;
async function acquireLock(key, ttl) {
  const lockKey = `lock:${key}`;
  const result = await redis.set(lockKey, "locked", "NX", "EX", ttl);
  return result === "OK";
}

async function releaseLock(key) {
  const lockKey = `lock:${key}`;
  await redis.del(lockKey);
}

// const hostelMap = new Map();
// hostelMap.set("BTech21", "kalam");
// hostelMap.set("BTech22", "kalam");
// hostelMap.set("BTech23", "aryabhatta");
function getBatch(rollnum) {
  const year = rollnum[0]+rollnum[1];
  if (rollnum[2] == "0") return "btech"+year;
  if (rollnum[2] == "1" && rollnum[3] == "1") return "mtech"+year;
  if (rollnum[2] == "1" && rollnum[3] == "2") return "msc"+year;
  if (rollnum[2] == "2") return "phd"+year;
  return "error";
}

function getRollNumber(preferred_username) {
  const mailParts = preferred_username.split("@")[0].split("_");
  if (mailParts.length != 2) return null;
  const rollnum = mailParts[0].startsWith("2") ? mailParts[0] : mailParts[1];
  return rollnum;
}

async function showDetails(req, res) {
  const rollnum = getRollNumber(req.auth.preferred_username);
  try {
    const student = await prisma.students.findUnique({
      where: { rollnum: rollnum },
    });
    const room = await prisma.rooms.findUnique({
      where: { roomId: student.room },
    });

    if (room.roommateCode && room.roommateCode.length != 0) {
      const codeGeneratedAt = new Date(room.codeGeneratedAt);
      const codeExpiryTime = new Date(
        codeGeneratedAt.getTime() + codeExpiryDelta
      ); // 10 minutes tak locked
      const now = new Date();

      if (now > codeExpiryTime) {
        room.roommateCode = "";
        room.codeGeneratedAt = "";
        await prisma.rooms.update({
          where: { roomId: student.room },
          data: {
            roommateCode: null,
            codeGeneratedAt: null,
          },
        });
      }
    }
    // console.log(student);
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
        roommateCode: room.roommateCode,
      });
    } else {
      res.status(400).json({ error: "kindly wait for allocation!" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getRoom(req, res) {
  const { batch, gender, hostel, floor } = req.body;
  if (batch == undefined || gender == undefined || hostel == undefined || floor == undefined) {
    res.sendStatus(422);
    return;
  }
  console.log("Getting rooms for batch:", batch);
  try {
    const validRooms = await prisma.rooms.findMany({
      where: {
        AND: [
          { batch: batch },
          { gender: gender },
          { hostel: hostel },
          { floor: floor },
          // { numFilled: { lt: prisma.rooms.fields.capacity } },
        ],
      },
    });
    let i;
    for (i = 0; i < validRooms.length; i++) {
      let room = validRooms[i];
      if (room.roommateCode && room.roommateCode.length != 0) {
        const codeGeneratedAt = new Date(room.codeGeneratedAt);
        const codeExpiryTime = new Date(
          codeGeneratedAt.getTime() + codeExpiryDelta
        ); // 10 minutes tak locked
        const now = new Date();

        if (now > codeExpiryTime) {
          room.roommateCode = null;
          room.codeGeneratedAt = null;
          await prisma.rooms.update({
            where: { roomId: room.roomId },
            data: {
              roommateCode: null,
              codeGeneratedAt: null,
            },
          });
        }
      }

      if (room.roommateCode) {
        room.roommateCode = "present";
      }
    }
    return res.status(200).json({ rooms: validRooms });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function roomBooking(req, res) {
  const { roomId, roommateCode, gender, batch } = req.body;
  const name = req.auth.name;
  const studentId = getRollNumber(req.auth.preferred_username);
  const lockKey = `room:${roomId}`;
  const studentLockKey = `student:${studentId}`;

  const studentLockAcquired = await acquireLock(studentLockKey, 30);

  if (!studentLockAcquired) {
    return res.status(400).json({
      error: "Could not acquire lock for student ID. Please try again.",
    });
  }

  const lockAcquired = await acquireLock(lockKey, 20); // TTL of 20 seconds
  if (!lockAcquired) {
    await releaseLock(studentLockKey);
    return res
      .status(400)
      .json({ error: "Could not acquire lock. Please try again." });
  }

  try {
    const room = await prisma.rooms.findUnique({
      where: { roomId },
    });

    if (!room) {
      console.log("Room does not exist:", roomId);
      return res.status(400).json({ error: "Room does not exist" });
    }

    const student = await prisma.students.findUnique({
      where: { rollnum: studentId },
    });

    if (student && student.allocated) {
      console.log("Student already allotted:", studentId);
      return res.status(400).json({
        error: "You have already been given a room. You cannot book any more!",
      });
    }

    // if (student.batch !== room.batch) {
    //   return res
    //     .status(400)
    //     .json({ error: "This room is not available for your batch!" });
    // }

    if (room.numFilled < room.capacity) {
      // console.log(room);
      const now = new Date();

      let generatedCode = null;

      if (room.numFilled === 0) {
        // gen a unique code if its completely empty along with "TIME stamp" stored in db
        generatedCode = crypto.randomBytes(4).toString("hex");
        room.roommateCode = generatedCode;
        room.codeGeneratedAt = now;
      } else {
        const codeGeneratedAt = new Date(room.codeGeneratedAt);
        const codeExpiryTime = new Date(
          codeGeneratedAt.getTime() + codeExpiryDelta
        ); // 10 minutes tak locked
        if (now > codeExpiryTime) {
          room.roommateCode = "";
          room.codeGeneratedAt = null;
          await prisma.rooms.update({
            where: { roomId: room.roomId },
            data: {
              roommateCode: null,
              codeGeneratedAt: null,
            },
          });
        } else if (roommateCode !== room.roommateCode) {
          return res.status(400).json({ error: "Invalid roommate code" });
        }
      }
      let students = room.students;
      students.push(studentId + " - " + name);
      await prisma.$transaction(async (prisma) => {
        let code = generatedCode || room.roommateCode;
        await prisma.rooms.update({
          where: { roomId },
          data: {
            numFilled: room.numFilled + 1,
            students: students,
            roommateCode: code,
            codeGeneratedAt: room.codeGeneratedAt,
          },
        });

        await prisma.students.create({
          data: {
            rollnum: studentId,
            name,
            allocated: true,
            roomnum: room.roomNum,
            room: roomId,
            hostel: room.hostel,
            occupancy: room.capacity,
            gender: gender,
            batch: batch,
          },
        });
      });

      return res.status(200).json({ message: "Room booked successfully" });
    } else {
      return res.status(400).json({ error: "Room is full" });
    }
  } catch (error) {
    console.error("Error during room booking:", error);
    return res.status(500).json({ error: error.message });
  } finally {
    await releaseLock(lockKey);
    await releaseLock(studentLockKey);
  }
}

export default {
  showDetails,
  getRoom,
  roomBooking,
};
/* vi: set et sw=2: */

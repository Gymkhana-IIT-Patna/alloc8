import Redis from "ioredis";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const redis = new Redis();

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

async function showDetails(req, res) {
  const { rollnum } = req.query;
  try {
    const student = await prisma.students.findUnique({
      where: { rollnum: rollnum },
    });

    if (student && student.allocated) {
      console.log(student);
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
      res.status(400).json({ error: "kindly wait for allocation!" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getRoom(req, res) {
  const { batch, gender, hostel, floor } = req.body;
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
    return res.status(200).json({ rooms: validRooms });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function roomBooking(req, res) {
  const { studentId, roomId, roomMates } = req.body;
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

    if (!student) {
      console.log("Student does not exist:", studentId);
      return res.status(400).json({ error: "Student does not exist" });
    }

    if (student.allocated) {
      return res.status(400).json({
        error: "You have already been given a room. You cannot book any more!",
      });
    }

    if (student.batch !== room.batch) {
      return res
        .status(400)
        .json({ error: "This room is not available for your batch!" });
    }

    if (room.numFilled < room.capacity) {
      console.log(room);
      await prisma.$transaction(async (prisma) => {
        let students = room.students;
        students.push(student.rollnum + " - " + student.name);
        await prisma.rooms.update({
          where: { roomId },
          data: { numFilled: room.numFilled + 1, students: students },
        });

        await prisma.students.update({
          where: { rollnum: studentId },
          data: {
            allocated: true,
            roomnum: room.roomNum,
            room: roomId,
            hostel: room.hostel,
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

import Redis from "ioredis"
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const redis = new Redis();

async function acquireLock(key, ttl) {
  const lockKey = `lock:${key}`;
  const result = await redis.set(lockKey, 'locked', 'NX', 'EX', ttl);
  return result === 'OK';
}

async function releaseLock(key) {
  const lockKey = `lock:${key}`;
  await redis.del(lockKey);
}


const hostelMap = new Map();
hostelMap.set("BTech21", "Kalam");
hostelMap.set("BTech22", "Kalam");
hostelMap.set("Btech23", "Aryabhatta");

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
      res.status(400).json({ error: "kindly wait for allocation!" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getRoom(req, res) {
  const { batch } = req.body;
  const hostel = hostelMap.get(batch);
  try {
    const validRooms = await prisma.rooms.findMany({
      where: {
        AND: [
          { hostel: hostel },
          { batch: batch },
          { numFilled: { lt: prisma.rooms.fields.capacity } },
        ],
      },
    });
    return res.status(200).json({ rooms: validRooms });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function roomBooking(req, res) {
  const { studentId, hostel, roomnum } = req.body;
  const lockKey = `room:${hostel}:${roomnum}`;

  const lockAcquired = await acquireLock(lockKey, 20); // TTL of 20 seconds
  if (!lockAcquired) {
    return res
      .status(400)
      .json({ error: "Could not acquire lock. Please try again." });
  }

  try {
    const room = await prisma.rooms.findUnique({
      where: { hostel: hostel, roomNum: roomnum },
    });

    if (room && room.numFilled < room.capacity) {
      await prisma.$transaction(async (prisma) => {
        await prisma.rooms.update({
          where: { hostel: hostel, roomNum: roomnum },
          data: { numFilled: room.numFilled + 1 },
        });

        await prisma.students.update({
          where: { id: studentId },
          data: { allocated: true, roomnum: roomnum, room: room.id },
        });
      });

      return res.status(200).json({ message: "Room booked successfully" });
    } else {
      return res.status(400).json({ error: "Room is full or does not exist" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  } finally {
    await releaseLock(lockKey);
  }
}

export default {
  showDetails,
  getRoom,
  roomBooking,
};

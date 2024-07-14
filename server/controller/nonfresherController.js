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

const hostelMap = new Map();
hostelMap.set("BTech21", "Kalam");
hostelMap.set("BTech22", "Kalam");
hostelMap.set("BTech23", "Aryabhatta");

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
  const { studentId, roomId } = req.body;
  const lockKey = `room:${roomId}`;

  const lockAcquired = await acquireLock(lockKey, 20); // TTL of 20 seconds
  if (!lockAcquired) {
    return res
      .status(400)
      .json({ error: "Could not acquire lock. Please try again." });
  }

  try {
    const room = await prisma.rooms.findUnique({
      where: { roomId: roomId },
    });

    const student = await prisma.rooms.findUnique({
      where: { rollnum: studentId },
    });
    
    if(student && student.allocated){
      return res.status(400).json({ error: "You have already been given a room. You can not book any more!" });
    }
    
    if(student && student.batch != room.batch){
      return res.status(400).json({ error: "This room is not available for your batch!" });
    }

    if (room  && student && room.numFilled < room.capacity) {
      await prisma.$transaction(async (prisma) => {
        await prisma.rooms.update({
          where: { roomId: roomId },
          data: { numFilled: room.numFilled + 1 },
        });

        await prisma.students.update({
          where: { rollnum: studentId },
          data: { allocated: true, roomnum: roomNum, room: roomId },
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

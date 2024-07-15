import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import available_rooms from "../../data-gen/available_rooms.json" assert { type: "json" };

async function main() {}

main()
  .then(async () => {
    for (let batch in available_rooms) {
      for (let gender in available_rooms[batch]) {
        for (let hostel in available_rooms[batch][gender]) {
          console.log("adding for", batch, gender, hostel);
          for (let floor in available_rooms[batch][gender][hostel]) {
            for (let room of available_rooms[batch][gender][hostel][floor]) {
              let capacity = 2;
              if (hostel.startsWith("asima") && batch == "btech23") {
                capacity = 3;
              }
              if (batch == "btech21") {
                capacity = 1;
              }
              if (
                [
                  "phd14",
                  "phd15",
                  "phd16",
                  "phd17",
                  "phd18",
                  "phd19",
                  "phd20",
                ].includes(batch) ||
                (batch == "phd21" && gender == "male")
              ) {
                capacity = 1;
              }

              await prisma.rooms.create({
                data: {
                  roomId: `${hostel}-${
                    floor.toString() + room.toString().padStart(2, "0")
                  }`,
                  hostel,
                  floor,
                  roomNum: floor.toString() + room.toString().padStart(2, "0"),
                  batch,
                  capacity,
                  numFilled: 0,
                },
              });
            }
          }
        }
      }
    }
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

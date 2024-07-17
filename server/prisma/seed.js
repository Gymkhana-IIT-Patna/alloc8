import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import available_rooms from "../../data-gen/available_rooms.json" assert { type: "json" };

async function main() {}

main()
  .then(async () => {
    const data = [];
    const ids = [];
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
		if(hostel == 'aryabhatta a' &&  room == 628){
			capacity = 1;
		}
		if(hostel == 'asima b' && room == 205){
			capacity = 1
		}
              //   console.log(
              //     `${hostel}-${
              //       floor.toString() + room.toString().padStart(2, "0")
              //     }`
              //   );
              ids.push(
                `${hostel}-${
                  floor.toString() + room.toString().padStart(2, "0")
                }-${batch}`
              );

              data.push({
                roomId: `${hostel}-${
                  floor.toString() + room.toString().padStart(2, "0")
                }-${batch}`,
                hostel,
                gender,
                floor,
                roomNum: room.toString().padStart(3, "0"),
                batch,
                capacity,
                numFilled: 0,
                students: [],
                roommateCode: "",
              });
            }
          }
        }
      }
    }

    const findDuplicates = (arr) => {
      let sorted_arr = arr.slice().sort(); // You can define the comparing function here.
      // JS by default uses a crappy string compare.
      // (we use slice to clone the array so the
      // original array won't be modified)
      let results = [];
      for (let i = 0; i < sorted_arr.length - 1; i++) {
        if (sorted_arr[i + 1] == sorted_arr[i]) {
          results.push(sorted_arr[i]);
        }
      }
      return results;
    };
    console.log("duplicate IDs", findDuplicates(ids));
    const createMany = await prisma.rooms.createMany({
      data: data,
    });
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

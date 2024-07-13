import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
const fresherRoutes = require('./routes/fresherRoutes');
const nonfresherRoutes = require('./routes/nonfresherRoutes');
const prisma = new PrismaClient();

// async function main() {
//   // ... you will write your Prisma Client queries here
// }

// main()
//   .then(async () => {
//     await prisma.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use("/fresher", fresherRoutes);
app.use("/nonfresher", nonfresherRoutes);

app.listen(8800, () => {
  console.log("Connected to Backend, Cool");
});

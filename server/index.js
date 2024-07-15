import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import fresherRoutes from "./routes/fresherRoutes.js";
import nonfresherRoutes from "./routes/nonfresherRoutes.js";
// const fresherRoutes = require('./routes/fresherRoutes');
// const nonfresherRoutes = require('./routes/nonfresherRoutes');
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

app.use("/api/fresher", fresherRoutes);
app.use("/api/nonfresher", nonfresherRoutes);
const PORT = 8800;
app.listen(PORT, () => {
  console.log("Connected to Backend on Port", PORT);
});

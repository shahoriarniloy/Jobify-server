import express, { json } from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import UserRouter from "./Routes/user.route.js";
import companyRoute from "./Routes/company.route.js";
import jobRouter from "./Routes/job.route.js";
import adminRouter from "./Routes/admin.route.js";
import otherRouter from "./Routes/other.route.js";

const app = express();
const port = process.env.PORT || 5000;

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://jobify-13db1.web.app",
      "https://jobify-13db1.firebaseapp.com",
      "https://jobify07.netlify.app",
    ],
    credentials: true,
  },
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://jobify-13db1.web.app",
      "https://jobify-13db1.firebaseapp.com",
      "https://jobify07.netlify.app",
    ],
    credentials: true,
  })
);

app.use(json());
app.use(UserRouter);
app.use(companyRoute);
app.use(jobRouter);
app.use(adminRouter);
app.use(otherRouter);

let onlineUsers = [];

async function run() {
  try {

    console.log("Successfully connected to MongoDB!");
  } finally {
    app.get("/", (req, res) => {
      res.send("Jobify server");
    });
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
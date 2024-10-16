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

const addNewUser = (email, socketId) => {
  !onlineUsers.some((user) => user.email === email) &&
    onlineUsers.push({ email, socketId });
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (email) => {
  return onlineUsers.find((user) => user.email === email);
};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  socket.on("newUser", (email) => {
    addNewUser(email, socket.id);
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log("A user disconnected", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("Jobify server is running");
});

server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

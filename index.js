import express, { json } from "express";
import http from 'http';
import cors from "cors";
import { Server } from "socket.io";
import UserRouter from "./Routes/user.route.js";
import companyRoute from "./Routes/company.route.js";
import jobRouter from "./Routes/job.route.js";
import adminRouter from "./Routes/admin.route.js";
import otherRouter from "./Routes/other.route.js";
import nodemailer from "nodemailer";

const app = express();
const port = process.env.PORT || 5000;

const server = http.createServer(app);
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://jobify-13db1.web.app",
    "https://jobify-13db1.firebaseapp.com",
    "https://jobify07.netlify.app",
    "https://jobify-job-portal.netlify.app",
    "https://jobi-fy.web.app"
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  credentials: true,
};

export const io = new Server(server, {
  cors: corsOptions
});

// Middleware
app.use(cors(corsOptions));
app.use(json());
app.use((req, res, next) => {
  req.io = io; // Attach the socket.io instance to the request object
  next();
});

// Routes
app.use(UserRouter);
app.use(companyRoute);
app.use(jobRouter);
app.use(adminRouter);
app.use(otherRouter);

// Online users management
let onlineUsers = [];

const addNewUser = (email, socketId) => {
  const userExists = onlineUsers.some(user => user.email === email);
  if (!userExists) {
    onlineUsers.push({ email, socketId });
  }
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter(user => user.socketId !== socketId);
};

const getUser = (email) => {
  return onlineUsers.find(user => user.email === email);
};

// Socket.io setup
io.on("connection", (socket) => {
  socket.on("newUser", (email) => {
    addNewUser(email, socket.id);
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });

  socket.on("sendMessage", ({ senderId, receiverId, message }) => {
    console.log('massa')
    const receiver = getUser(receiverId);
    if (receiver) {
      socket.emit("receiveMessage", {
        senderId,
        message,
        timestamp: new Date()
      });
    }
  });
});
// .to(receiver.socketId)

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default transporter;

// check route
app.get("/", (req, res) => {
  res.send("Jobify server is running");
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

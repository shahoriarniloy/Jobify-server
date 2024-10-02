import express from 'express';
import { createUser, createUserBookmark, deleteUserBookmark, getAllReview, getUserBookmark, getUserRole, postReview } from '../Controllers/user.controller.js';
const userRouter = express.Router();

// Get route
userRouter.get("/user-role", getUserRole);
userRouter.get("/bookmarks/:userEmail", getUserBookmark);
userRouter.get("/reviews", getAllReview);



// Post Route
userRouter.post("/users", createUser);
userRouter.post("/bookmarks", createUserBookmark);
userRouter.post("/reviews", postReview);


// Delete Route
userRouter.delete("/bookmarks/:email/:jobId", deleteUserBookmark);



export default userRouter;


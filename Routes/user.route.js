import express from 'express';
import { checkJobAlreadyApplied, createUser, createUserBookmark, deleteUserBookmark, getAllReview, getMessage, getUserBookmark, getUserRole, individualMessage, postReview, sendMessage, userConversion, userDetails } from '../Controllers/user.controller.js';
const userRouter = express.Router();

// Get route
userRouter.get("/user-role", getUserRole);
userRouter.get("/bookmarks", getUserBookmark);
userRouter.get("/reviews", getAllReview);
userRouter.get("/check-already-applied", checkJobAlreadyApplied);
userRouter.get('/messages/:receiverEmail/:senderEmail', getMessage);
userRouter.get('/user-details', userDetails);
userRouter.get('/conversations',userConversion );
userRouter.get('/individual-messages', individualMessage);




// Post Route
userRouter.post("/users", createUser);
userRouter.post("/bookmarks", createUserBookmark);
userRouter.post("/reviews", postReview);
userRouter.post("/sendMessage", sendMessage);


// Delete Route
userRouter.delete("/bookmarks/:email/:jobId", deleteUserBookmark);



export default userRouter;


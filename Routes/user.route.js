import express from "express";
import {
  checkJobAlreadyApplied,
  checkAppliedJobs,
  searchJobSeekers,
  createUser,
  createUserBookmark,
  deleteUserBookmark,
  getAllReview,
  getMessage,
  getUserBookmark,
  getUserRole,
  individualMessage,
  postReview,
  sendMessage,
  postStatus,
  userConversion,
  userDetails,
  getPosts,
  postLike,
  postComment,
  getPost,
  postUnlike,
  followJobSeeker,
  unfollowJobSeeker,
  checkFollowStatus,
} from "../Controllers/user.controller.js";
const userRouter = express.Router();

// Get route
userRouter.get("/user-role", getUserRole);
userRouter.get("/job-seekers", searchJobSeekers);
userRouter.get("/check-follow-status", checkFollowStatus);
userRouter.get("/bookmarks", getUserBookmark);
userRouter.get("/reviews", getAllReview);
userRouter.get("/check-already-applied", checkJobAlreadyApplied);
userRouter.get("/check-applied-jobs", checkAppliedJobs);
userRouter.get("/messages/:receiverEmail/:senderEmail", getMessage);
userRouter.get("/user-details", userDetails);
userRouter.get("/conversations", userConversion);
userRouter.get("/individual-messages", individualMessage);
userRouter.get("/posts", getPosts);
userRouter.get("/post/:postId", getPost);

// Post Route
userRouter.post("/users", createUser);
userRouter.post("/bookmarks", createUserBookmark);
userRouter.post("/reviews", postReview);
userRouter.post("/sendMessage", sendMessage);
userRouter.post("/postStatus", postStatus);
userRouter.post("/follow-job-seeker", followJobSeeker);

// Delete Route
userRouter.delete("/unfollow-job-seeker", unfollowJobSeeker);

userRouter.delete("/bookmarks/:email/:jobId", deleteUserBookmark);

// Put Route

userRouter.put("/posts/:postId/like", postLike);
userRouter.put("/posts/:postId/unlike", postUnlike);
userRouter.post("/posts/:postId/comment", postComment);

export default userRouter;

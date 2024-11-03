import express from "express";
import {
  checkJobAlreadyApplied,
  checkAppliedJobs,
  searchJobSeekers,
  createEmployeeAccount,
  createCompanyAccount,
  createUserBookmark,
  deleteUserBookmark,
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
  postProfileSettings,
  postUserInfo,
  getUserByEmail,
  getResumeByEmail,
  createOrUpdateResume,
  getJobCountsByEmail,
  getFavoriteCompanies,
  addFavoriteCompany,
  deleteFavoriteCompany,
  getAllUsers,
  checkIsFavorite,
  getLatestJobsForUser,
  getCareerSuggestions,
  postMassage,
  getAllMessage,
  getFollowers,
  getFollowing,
  getMutualConnections,
  suggestJobSeekers,
  getOwnPosts,
  deletePost,
  removeFollower,
  paymentIntent,
} from "../Controllers/user.controller.js";
import { jobCategories } from "../Controllers/job.controller.js";
const userRouter = express.Router();

// Get route
userRouter.get("/user-role", getUserRole);
userRouter.get("/job-seekers", searchJobSeekers);
userRouter.get("/check-follow-status", checkFollowStatus);
userRouter.get("/bookmarks", getUserBookmark);
userRouter.get("/check-already-applied", checkJobAlreadyApplied);
userRouter.get("/check-applied-jobs", checkAppliedJobs);
userRouter.get("/messages/:receiverEmail/:senderEmail", getMessage);
userRouter.get("/user-details", userDetails);
userRouter.get("/conversations", userConversion);
userRouter.get("/individual-messages", individualMessage);
userRouter.get("/posts", getPosts);
userRouter.get("/post/:postId", getPost);
userRouter.get("/users/:email", getUserByEmail);
userRouter.get("/resume/:email", getResumeByEmail);
userRouter.get("/getJobCountsByEmail/:email", getJobCountsByEmail);
userRouter.get("/users", getAllUsers);
userRouter.get("/users/:userEmail/favorite-company", getFavoriteCompanies);
userRouter.get("/users/:email/favorite-company/:companyEmail", checkIsFavorite);
userRouter.get("/users/:userEmail/latest-jobs", getLatestJobsForUser);
userRouter.get("/jobCategories", jobCategories);
userRouter.get("/get-all-message", getAllMessage);
userRouter.get("/users/followers/:userEmail", getFollowers);
userRouter.get("/users/following/:userEmail", getFollowing);
userRouter.get("/users/mutual-connections/:userEmail", getMutualConnections);
userRouter.get("/users/suggestions/:userEmail", suggestJobSeekers);
userRouter.get("/ownPosts/:userEmail", getOwnPosts);

// Post Route
// create employee account
userRouter.post("/create-employee-account", createEmployeeAccount);
// carate company account
userRouter.post("/create-company-account", createCompanyAccount);

userRouter.post("/bookmarks", createUserBookmark);
userRouter.post("/reviews", postReview);
userRouter.post("/sendMessage", sendMessage);
userRouter.post("/postStatus", postStatus);
userRouter.post("/follow-job-seeker", followJobSeeker);
userRouter.post("/userInfo-updating", postUserInfo);
userRouter.post("/profile-updating", postProfileSettings);
userRouter.post("/createOrUpdateResume", createOrUpdateResume);
userRouter.post("/users/:userEmail/favorite-company", addFavoriteCompany);
userRouter.post("/getCareerSuggestions", getCareerSuggestions);

userRouter.post("/send-massage", postMassage);

// Delete Route
userRouter.delete("/unfollow-job-seeker", unfollowJobSeeker);
userRouter.delete("/bookmarks/:email/:jobId", deleteUserBookmark);
userRouter.delete(
  "/users/:userEmail/favorite-company/:companyEmail",
  deleteFavoriteCompany
);
userRouter.delete("/posts/:postId", deletePost);
userRouter.delete("/remove-follower", removeFollower);

// Put Route

userRouter.put("/posts/:postId/like", postLike);
userRouter.put("/posts/:postId/unlike", postUnlike);
userRouter.post("/posts/:postId/comment", postComment);
userRouter.post('/create-intent',paymentIntent);

export default userRouter;

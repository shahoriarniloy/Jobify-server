import express from "express";
import {
  advanceSearch,
  applyAJob,
  checkAlreadyApplied,
  companiesJobs,
  getAllJobs,
  getPostedJobs,
  getSpecificJob,
  RelatedJobs,
  searchLocation,
  singleJob,
  getAppliedCandidates,
  companiesJobApplication,
  updateCandidateStatus,
  postJob,
  homePageInfo,
  jobCategories,
} from "../Controllers/job.controller.js";

const jobRouter = express.Router();

// Get Route
jobRouter.get("/jobs/advanced-search", advanceSearch);
jobRouter.get("/jobs/search", searchLocation);
jobRouter.get("/jobs/:id", getSpecificJob);
// jobRouter.get("/jobs-count", getAllJobsCounts);
jobRouter.get("/jobs", getAllJobs);
jobRouter.get("/check_application", checkAlreadyApplied);
jobRouter.get("/company-jobs", getPostedJobs);
jobRouter.get("/jobs/company/:email", companiesJobs);
jobRouter.get("/jobs/dashboard/company/:email", companiesJobApplication);
jobRouter.get("/single-job/:id", singleJob);
jobRouter.get("/RelatedJobs", RelatedJobs);
jobRouter.get("/appliedCandidates", getAppliedCandidates);
jobRouter.get("/jobCategories", jobCategories);

jobRouter.get("/homepage-info", homePageInfo);

// Post Route
jobRouter.post("/postJob", postJob);
jobRouter.post("/apply_job", applyAJob);

// Update Route

jobRouter.patch("/updateCandidateStatus", updateCandidateStatus);

export default jobRouter;
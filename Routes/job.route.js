import express from 'express';
import { advanceSearch, applyAJob, checkAlreadyApplied, companiesJobs, getAllJobs, getAllJobsCounts, getPostedJobs, getSpecificJob, postAJob, searchLocation, singleJob } from '../Controllers/job.controller.js';

const jobRouter = express.Router();


// Get Route
jobRouter.get("/jobs/advanced-search", advanceSearch);
jobRouter.get("/jobs/search", searchLocation);
jobRouter.get("/jobs/:id", getSpecificJob);
jobRouter.get("/jobs-count", getAllJobsCounts);
jobRouter.get("/jobs", getAllJobs);
jobRouter.get("/check_application", checkAlreadyApplied);
jobRouter.get("/company-jobs", getPostedJobs);
jobRouter.get("/jobs/company/:companyId", companiesJobs);
jobRouter.get("/single-job/:id", singleJob);

// Post Route
jobRouter.post("/postJob", postAJob);
jobRouter.post("/apply_job", applyAJob);


// Update Route





export default jobRouter;
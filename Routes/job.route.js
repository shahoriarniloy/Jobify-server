import express from 'express';
import { advanceSearch, applyAJob, checkAlreadyApplied, getAllJobs, getAllJobsCounts, getPostedJobs, getSpecificJob, postAJob, searchLocation } from '../Controllers/job.controller.js';

const jobRouter = express.Router();


// Get Route
jobRouter.get("/jobs/advanced-search", advanceSearch);
jobRouter.get("/jobs/search", searchLocation);
jobRouter.get("/jobs/:id", getSpecificJob);
jobRouter.get("/jobs/count", getAllJobsCounts);
jobRouter.get("/jobs", getAllJobs);
jobRouter.get("/check_application", checkAlreadyApplied);
jobRouter.get("/company-jobs/:id", getPostedJobs);

// Post Route
jobRouter.post("/postJob", postAJob);
jobRouter.post("/apply_job", applyAJob);


// Update Route





export default jobRouter;
import express from "express";
import {
  getJobSeekerStats,
  getEmployerStats,
  getJobStats,
  getApplicationStats,
  getRecentJobSeekers,
  getRecentJobs,
} from "../Controllers/admin.controller.js";
const adminRouter = express.Router();

adminRouter.get("/admin/job-seekers/stats", getJobSeekerStats);
adminRouter.get("/admin/employers/stats", getEmployerStats);
adminRouter.get("/admin/jobs/stats", getJobStats);
adminRouter.get("/admin/applications/stats", getApplicationStats);
adminRouter.get("/admin/job-seekers/recent", getRecentJobSeekers);
adminRouter.get("/admin/jobs/recent", getRecentJobs);

export default adminRouter;

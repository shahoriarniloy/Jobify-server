import {
  userCollection,
  jobsCollection,
  applicationsCollection,
  companiesCollection,
} from "../Models/database.model.js";

export const getJobSeekerStats = async (req, res) => {
  try {
    const totalJobSeekers = await userCollection.countDocuments({
      role: "Job Seeker",
    });
    res.json({ total: totalJobSeekers });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getEmployerStats = async (req, res) => {
  try {
    const totalEmployers = await companiesCollection.countDocuments({});
    res.json({ total: totalEmployers });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getJobStats = async (req, res) => {
  try {
    const totalJobs = await jobsCollection.countDocuments();
    res.json({ total: totalJobs });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getApplicationStats = async (req, res) => {
  try {
    const totalApplications = await applicationsCollection.countDocuments();
    res.json({ total: totalApplications });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getRecentJobSeekers = async (req, res) => {
  try {
    const recentJobSeekers = await userCollection
      .find({ role: "Job Seeker" })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    res.json(recentJobSeekers);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getRecentJobs = async (req, res) => {
  try {
    const recentJobs = await jobsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    res.json(recentJobs);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

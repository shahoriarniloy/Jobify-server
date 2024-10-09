import { ObjectId } from "mongodb";
import {
  applicationsCollection,
  jobsCollection,
  userCollection,
} from "../Models/database.model.js";

export const postAJob = async (req, res) => {
  const jobData = req.body;
  try {
    const result = await jobsCollection.insertOne(jobData);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export const advanceSearch = async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const size = parseInt(req.query.size) || 10;
  const currentDateString = new Date().toISOString().split("T")[0];
  const {
    searchTerm,
    location,
    experience,
    jobType,
    education,
    jobLevel,
    salaryRange,
  } = req.query;

  const query = {
    deadline: { $gte: currentDateString },
  };

  if (searchTerm) {
    query.$or = [
      { title: { $regex: searchTerm, $options: "i" } },
      { company: { $regex: searchTerm, $options: "i" } },
    ];
  }

  if (location && location.trim()) {
    query.location = { $regex: location, $options: "i" };
  }

  if (experience && experience.length > 0) {
    query.experience = { $in: experience.split(",") };
  }

  if (jobType && jobType.length > 0) {
    query.jobType = { $in: jobType.split(",") };
  }

  if (education && education.length > 0) {
    query.education = { $in: education.split(",") };
  }

  if (jobLevel && jobLevel.length > 0) {
    query.jobLevel = { $in: jobLevel.split(",") };
  }
  if (salaryRange && salaryRange.includes("-")) {
    const [minSalary, maxSalary] = salaryRange
      .replace(/\$/g, "")
      .split("-")
      .map(Number);
    if (!isNaN(minSalary) && !isNaN(maxSalary)) {
      query.salaryRange = {
        $regex: `^\\$(${minSalary}|[${
          minSalary + 1
        }-${maxSalary}][0-9]*|[1-9][0-9]{2,})-\\$${maxSalary}$`,
      };
    }
  }

  try {
    const totalJobs = await jobsCollection.countDocuments(query);

    const cursor = jobsCollection
      .find(query)
      .skip(page * size)
      .limit(size);
    const result = await cursor.toArray();
    res.json({ totalJobs, jobs: result });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

export const searchLocation = async (req, res) => {
  const { searchTerm, location } = req.query;
  const currentDateString = new Date().toISOString().split("T")[0];

  const query = {
    deadline: { $gte: currentDateString },
  };

  if (searchTerm) {
    query.$or = [
      { title: { $regex: searchTerm, $options: "i" } },
      { company: { $regex: searchTerm, $options: "i" } },
    ];
  }

  if (location) {
    query.location = { $regex: location, $options: "i" };
  }

  try {
    if (!searchTerm && !location) {
      return res.json([]);
    }

    const result = await jobsCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

export const getSpecificJob = async (req, res) => {
  const { id } = req.params;
  try {
    const job = await jobsCollection.findOne({ _id: new ObjectId(id) });
    if (!job) {
      return res.status(404).send("Job not found");
    }
    res.json(job);
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

export const getAllJobsCounts = async (req, res) => {
  try {
    const count = await jobsCollection.countDocuments();
    res.json({ totalJobs: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 10;
    const currentDate = new Date();

    const currentDateString = currentDate.toISOString().split("T")[0];
    const query = { deadline: { $gte: currentDateString } };
    const totalJobs = await jobsCollection.countDocuments(query);
    const cursor = jobsCollection
      .find(query)
      .skip(page * size)
      .limit(size);
    const result = await cursor.toArray();
    res.json({ totalJobs, jobs: result });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

export const applyAJob = async (req, res) => {
  const application = {
    ...req.body,
    status: "Pending",
  };

  const result = await applicationsCollection.insertOne(application);
  res.send(result);
};

export const updateCandidateStatus = async (req, res) => {
  const { email, status, applicationId } = req.body;

  if (!email || !status) {
    return res.send({ message: "Email and status are required." });
  }

  const result = await applicationsCollection.updateOne(
    { user_email: email, _id: new ObjectId(applicationId) },
    { $set: { status: status } }
  );

  if (result.matchedCount === 0) {
    return res.send({ message: "Candidate not found." });
  }

  res.send({ message: "Status updated successfully." });
};

export const checkAlreadyApplied = async (req, res) => {
  const { job_id, user_email } = req.query;
  try {
    const application = await applicationsCollection.findOne({
      job_id,
      user_email,
    });

    if (application) {
      res.status(200).send({ applied: true });
    } else {
      res.status(200).send({ applied: false });
    }
  } catch (error) {
    res.status(500).send({ message: "Error checking application status" });
  }
};

export const getPostedJobs = async (req, res) => {
  console.log("called");
  const email = req.query.email;

  const jobs = await jobsCollection.find({ hrEmail: email }).toArray();

  res.send(jobs);
};

export const companiesJobs = async (req, res) => {
  const { email } = req.params;
  console.log(email);
  try {
    const jobs = await jobsCollection
      .find({
        $or: [{ email: email }, { hrEmail: email }],
      })
      .toArray();
    if (!jobs.length) {
      return res.status(404).send("No jobs found for this company");
    }

    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs by company ID:", error);
    res.status(500).send("Server Error");
  }
};

export const companiesJobApplication = async (req, res) => {
  const { email } = req.params;

  try {
    const jobs = await jobsCollection
      .find({ $or: [{ email }, { hrEmail: email }] })
      .toArray();

    if (!jobs.length) {
      return res.status(404).send("No jobs found for this company");
    }

    const jobIds = jobs.map((job) => job._id.toString());

    // Fetch all applications related to the company's jobs
    const applications = await applicationsCollection
      .find({ job_id: { $in: jobIds } })
      .toArray();

    // Aggregate application statuses
    const statusCountMap = applications.reduce((acc, application) => {
      acc[application.status] = (acc[application.status] || 0) + 1;
      return acc;
    }, {});

    // Define all the statuses that we care about
    const statuses = [
      "Pending",
      "Under Review",
      "Shortlisted",
      "Interview Scheduled",
      "Assessment Task",
      "Rejected",
      "Hired",
    ];

    // Ensure every status exists in the map, even if the count is 0
    statuses.forEach((status) => {
      if (!statusCountMap[status]) {
        statusCountMap[status] = 0;
      }
    });

    // Add applications count and other status information to each job
    const jobsWithApplicationCount = jobs.map((job) => ({
      ...job,
      applicationsCount: applications.filter(
        (app) => app.job_id === job._id.toString()
      ).length,
      statusCounts: {
        Pending: statusCountMap["Pending"] || 0,
        UnderReview: statusCountMap["Under Review"] || 0,
        Shortlisted: statusCountMap["Shortlisted"] || 0,
        InterviewScheduled: statusCountMap["Interview Scheduled"] || 0,
        AssessmentTask: statusCountMap["Assessment Task"] || 0,
        Rejected: statusCountMap["Rejected"] || 0,
        Hired: statusCountMap["Hired"] || 0,
      },
    }));

    res.json(jobsWithApplicationCount);
  } catch (error) {
    console.error("Error fetching company job data:", error);
    res.status(500).send("Internal server error");
  }
};

export const singleJob = async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid Job ID" });
  }

  try {
    const result = await jobsCollection.findOne({ _id: new ObjectId(id) });

    if (!result) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

export const RelatedJobs = async (req, res) => {
  const jobTitle = req.query.title;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  const skip = (page - 1) * limit;

  const query = jobTitle ? { title: { $regex: jobTitle, $options: "i" } } : {};

  const jobs = await jobsCollection
    .find(query)
    .skip(skip)
    .limit(limit)
    .toArray();

  const totalJobs = await jobsCollection.countDocuments(query);

  const totalPages = Math.ceil(totalJobs / limit);

  if (jobs.length === 0) {
    return res.status(404).json({ error: "No job found" });
  }

  res.send({ jobs, totalPages });
};

export const getAppliedCandidates = async (req, res) => {
  let { job_id } = req.query;

  const applications = await applicationsCollection.find({ job_id }).toArray();
  console.log("Applications found:", applications);

  if (applications.length === 0) {
    return res
      .status(404)
      .send({ message: "No applications found for this job_id" });
  }

  const userEmails = applications.map((app) => app.user_email);
  console.log("User emails collected:", userEmails);

  const users = await userCollection
    .find({ email: { $in: userEmails } })
    .toArray();
  console.log("Users found:", users);

  const response = [];
  for (let i = 0; i < applications.length; i++) {
    const application = applications[i];

    const user = users.find((user) => user.email === application.user_email);
    response.push({
      application: {
        _id: application._id,
        user_email: application.user_email,
        status: application.status,
      },
      user: user
        ? {
            _id: user._id,
            name: user.name,
            email: user.email,
            photoURL: user.photoURL,
          }
        : null,
    });
  }

  return res.send(response);
};

import { ObjectId } from "mongodb";
import transporter from "../index.js";
import {
  applicationsCollection,
  companiesCollection,
  jobCategory,
  jobsCollection,
  reviewsCollection,
  userCollection,
} from "../Models/database.model.js";

// for home page

export const homePageInfo = async (req, res) => {
  try {
    // Count the total number of jobs and companies
    const jobCount = await jobsCollection.countDocuments();
    const companyCount = await companiesCollection.countDocuments();
    const categoryCounts = await jobCategory.find().toArray();
    const successPeoples = (
      await applicationsCollection.find({ status: "Hired" }).toArray()
    ).length;
    const candidates = (
      await userCollection.find({ role: "Job Seeker" }).toArray()
    ).length;
    const reviews = await reviewsCollection.find().toArray();

    const response = {
      jobCount,
      companyCount,
      categoryCounts,
      successPeoples,
      candidates,
      reviews,
    };

    res.send(response);
  } catch (error) {
    res.status(500).send({ message: "Error fetching homepage info" });
  }
};


export const jobCategories = async (req, res) => {
  const categories = await jobCategory.find().toArray();
  res.send(categories);
};


export const postJob = async (req, res) => {
  const job = req.body;
  const jobCategoryName = job?.jobInfo?.jobCategory;
  const result = await jobsCollection.insertOne(job);
  await jobCategory.updateOne(
    { name: jobCategoryName },
    { $inc: { count: 1 } }
  );
  const insertedId = result.insertedId;

  req.io.emit("jobPosted", {
    jobId: insertedId,
    jobTitle: job.title,
    company: job.company,
  });

  const categoryName = job.jobCategory;

  const categoryCountUpdate = await jobCategoryCollection.updateOne(
    { name: categoryName },
    { $inc: { count: 1 } }
  );

  res.status(201).json({ message: "Job posted successfully!", job });
};

export const advanceSearch = async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const size = parseInt(req.query.size) || 10;
  const currentDateString = new Date().toISOString().split("T")[0]; // Current date in YYYY-MM-DD format

  const {
    searchTerm,
    location,
    experience,
    jobType,
    education,
    jobLevel,
    salaryRange,
  } = req.query;

  // Main query object
  const query = {
    "jobInfo.deadline": { $gte: currentDateString }, // Ensure deadline is inside jobInfo and greater than or equal to the current date
  };

  // Search by title or company inside jobInfo
  if (searchTerm) {
    query.$or = [
      { "jobInfo.title": { $regex: searchTerm, $options: "i" } },
      { "jobInfo.company": { $regex: searchTerm, $options: "i" } },
    ];
  }

  // Filter by location
  if (location && location.trim()) {
    query["jobInfo.location"] = { $regex: location, $options: "i" };
  }

  // Filter by experience
  if (experience && experience.length > 0) {
    query["jobInfo.experience"] = { $in: experience.split(",") };
  }

  // Filter by job type
  if (jobType && jobType.length > 0) {
    query["jobInfo.jobType"] = { $in: jobType.split(",") };
  }

  // Filter by education
  if (education && education.length > 0) {
    query["jobInfo.education"] = { $in: education.split(",") };
  }

  // Filter by job level
  if (jobLevel && jobLevel.length > 0) {
    query["jobInfo.jobLevel"] = { $in: jobLevel.split(",") };
  }

  // Filter by salary range
  if (salaryRange && salaryRange.includes("-")) {
    const [minSalary, maxSalary] = salaryRange
      .replace(/\$/g, "") // Remove $ symbols
      .split("-")
      .map(Number);

    if (!isNaN(minSalary) && !isNaN(maxSalary)) {
      query["jobInfo.salaryRange"] = {
        $gte: `$${minSalary}`,
        $lte: `$${maxSalary}`,
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
    res.send({ totalJobs, jobs: result });
  } catch (error) {
    console.error("Error fetching jobs:", error);
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

export const getAllJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 10;
    const currentDate = new Date();

    const currentDateString = currentDate.toISOString().split("T")[0];
    const query = { deadline: { $gte: currentDateString } };
    const totalJobCount = (await jobsCollection.find(query).toArray()).length;
    const cursor = jobsCollection
      .find(query)
      .skip(page * size)
      .limit(size);
    const allJobs = await cursor.toArray();
    res.send({ allJobs, totalJobCount });
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
  const {
    email,
    status,
    applicationId,
    name,
    jobId,
    interviewDate,
    interviewTime,
    roomId,
  } = req.body;

  if (!email || !status || !applicationId || !name || !jobId) {
    return res.status(400).send({
      message: "Email, status, applicationId, name, and jobId are required.",
    });
  }

  const job = await jobsCollection.findOne({ _id: new ObjectId(jobId) });

  if (!job) {
    return res.status(404).send({ message: "Job not found." });
  }

  const updateData = { status: status };

  if (status === "Interview Scheduled") {
    if (!interviewDate || !interviewTime || !roomId) {
      return res.status(400).send({
        message:
          "Interview date, time, and room ID are required for scheduling an interview.",
      });
    }

    const existingApplication = await applicationsCollection.findOne({
      user_email: email,
      _id: new ObjectId(applicationId),
    });
    if (existingApplication && existingApplication.interviewDetails) {
      return res.status(400).send({ message: "Interview already scheduled." });
    }

    updateData.interviewDetails = {
      date: interviewDate,
      time: interviewTime,
      roomId: roomId,
    };
  } else {
    const existingApplication = await applicationsCollection.findOne({
      user_email: email,
      _id: new ObjectId(applicationId),
    });

    if (existingApplication && existingApplication.interviewDetails) {
      updateData.interviewDetails = null;
    }
  }

  const result = await applicationsCollection.updateOne(
    { user_email: email, _id: new ObjectId(applicationId) },
    { $set: updateData }
  );

  if (result.matchedCount === 0) {
    return res.status(404).send({ message: "Candidate not found." });
  }

  let emailContent = `Dear ${name},\n\n${job.company} has updated your application status to "${status}" for the ${job.title} position.\n\n`;

  if (status === "Interview Scheduled") {
    emailContent += `Your interview is scheduled on ${interviewDate} at ${interviewTime} in Room ID: ${roomId}.\n\n`;
  }

  emailContent += "Best regards,\nJobify";

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Application Status has been Updated",
    text: emailContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.send({
      message: "Status updated and email sent successfully.",
    });
  } catch (err) {
    // console.error("Error sending email:", err);
    return res.status(500).send({
      message: "Status updated, but email failed to send.",
    });
  }
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
  const email = req.query.email;

  const jobs = await jobsCollection.find({ hrEmail: email }).toArray();

  res.send(jobs);
};

export const companiesJobs = async (req, res) => {
  const { email } = req.params;
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
    res.status(500).send("Server Error");
  }
};

export const companiesJobApplication = async (req, res) => {
  const { email } = req.params;
  const jobs = await jobsCollection
    .find({ $or: [{ email }, { hrEmail: email }] })
    .toArray();
  if (!jobs.length) {
    return res.status(404).send("No jobs found for this company");
  }
  const jobIds = jobs.map((job) => job._id.toString());
  const applications = await applicationsCollection
    .find({ job_id: { $in: jobIds } })
    .toArray();
  const applicationCountMap = applications.reduce((acc, application) => {
    acc[application.job_id] = (acc[application.job_id] || 0) + 1;
    return acc;
  }, {});
  const jobsWithApplicationCount = jobs.map((job) => ({
    ...job,
    applicationsCount: applicationCountMap[job._id.toString()] || 0,
  }));
  res.json(jobsWithApplicationCount);
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
  // console.log("Applications found:", applications);

  if (applications.length === 0) {
    return res
      .status(404)
      .send({ message: "No applications found for this job_id" });
  }

  const userEmails = applications.map((app) => app.user_email);
  // console.log("User emails collected:", userEmails);

  const users = await userCollection
    .find({ email: { $in: userEmails } })
    .toArray();
  // console.log("Users found:", users);

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

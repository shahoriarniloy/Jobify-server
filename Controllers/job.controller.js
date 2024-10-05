import { ObjectId } from "mongodb";
import {
  applicationsCollection,
  jobsCollection,
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

// export const advanceSearch = async (req, res) => {
//     const page = parseInt(req.query.page) || 0;
//     const size = parseInt(req.query.size) || 10;
//     const currentDateString = new Date().toISOString().split("T")[0];

//     // const {
//     //     searchTerm,
//     //     location,
//     //     experience,
//     //     jobType,
//     //     education,
//     //     jobLevel,
//     //     salaryRange,
//     // } = req.query?.advanceFilteredData;
//     console.log(req.query)

//     // Aggregation pipeline array
//     const pipeline = [];

//     // 1. Deadline Filter
//     pipeline.push({
//         $match: { deadline: { $gte: currentDateString } }
//     });

//     // 2. Search Term Filter
//     // Check company field with trimmed regex
//     /**
//     if (searchTerm) {
//         pipeline.push({
//             $match: {
//                 $or: [
//                     { title: { $regex: searchTerm.trim(), $options: "i" } },
//                     { company: { $regex: searchTerm.trim(), $options: "i" } }
//                 ]
//             }
//         });
//     }

//     // 3. Location Filter
//     if (location && location.trim()) {
//         pipeline.push({
//             $match: {
//                 location: { $regex: location, $options: "i" }
//             }
//         });
//     }

//     // 4. Experience Filter
//     if (experience && experience.length > 0) {
//         const experienceArray = experience.split(",");
//         pipeline.push({
//             $match: { experience: { $in: experienceArray } }
//         });
//     }

//     // 5. Job Type Filter
//     if (jobType && jobType.length > 0) {
//         const jobTypeArray = jobType.split(",");
//         pipeline.push({
//             $match: { jobType: { $in: jobTypeArray } }
//         });
//     }

//     // 6. Education Filter
//     if (education && education.length > 0) {
//         const educationArray = education.split(",");
//         pipeline.push({
//             $match: { education: { $in: educationArray } }
//         });
//     }

//     // 7. Job Level Filter
//     if (jobLevel && jobLevel.length > 0) {
//         const jobLevelArray = jobLevel.split(",");
//         pipeline.push({
//             $match: { jobLevel: { $in: jobLevelArray } }
//         });
//     }

//     // 8. Salary Range Filter
//     if (salaryRange && salaryRange.includes("-")) {
//         const [minSalary, maxSalary] = salaryRange.replace(/\$/g, "").split("-").map(Number);
//         if (!isNaN(minSalary) && !isNaN(maxSalary)) {
//             pipeline.push({
//                 $match: {
//                     salary: {
//                         $gte: minSalary,
//                         $lte: maxSalary
//                     }
//                 }
//             });
//         }
//     }

//     pipeline.push({ $skip: page * size });
//     pipeline.push({ $limit: size });

//     try {
//         // Calculate total number of matching jobs
//         const totalJobsPipeline = [...pipeline];
//         totalJobsPipeline.push({ $count: "totalJobs" });
//         const totalJobsResult = await jobsCollection.aggregate(totalJobsPipeline).toArray();
//         const totalJobs = totalJobsResult.length > 0 ? totalJobsResult[0].totalJobs : 0;

//         // Get paginated jobs
//         const jobs = await jobsCollection.aggregate(pipeline).toArray();

//         // console.log(totalJobsResult,totalJobs,jobs)

//         res.json({ totalJobs, jobs });
//     } catch (error) {
//         console.error("Error in advanceSearch:", error);
//         res.status(500).send("Server Error");
//     }
//     */
// };

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
    status: "pending"  
  };

  const result = await applicationsCollection.insertOne(application);
  res.send(result);
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

export const singleJob = async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid Job ID" });
  }


export const companiesJobs = async (req, res) => {
    const { email } = req.params;
    // console.log(email);
    try {
        const jobs = await jobsCollection
            .find({
                $or: [
                    { email: email },
                    { hrEmail: email } 
                ]
            })
            .toArray();
        if (!jobs.length) {
            return res.status(404).send("No jobs found for this company");
        }

        res.json(jobs);
    } catch (error) {
        // console.error("Error fetching jobs by company ID:", error);
        res.status(500).send("Server Error");

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

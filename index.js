const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://jobify-13db1.web.app",
      "https://jobify-13db1.firebaseapp.com",
      "https://jobify07.netlify.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dxgrzuk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: false,
  },
});

async function run() {
  try {
    await client.connect();
    const database = client.db("jobifyDB");

    const companiesCollection = database.collection("companies");
    const jobsCollection = database.collection("jobs");
    const reviewsCollection = database.collection("reviews");
    const userCollection = database.collection("users");
    const bookmarksCollection = database.collection("bookmarks");
    const jobCollection = database.collection("jobs");
    const applicationsCollection = database.collection("applications");
    const conversationsCollection = database.collection("conversations");
    const messagesCollection = database.collection("messages");


    app.post("/postJob", async (req, res) => {
      const jobData = req.body;


      try {
        const result = await jobCollection.insertOne(jobData);
        res.status(201).send(result); 
      } catch (error) {
        console.error("Error posting job:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    app.get("/company-jobs/:id", async (req, res) => {
      const companyId = req.params.id;
      // console.log("Fetching jobs for company:", companyId);

      try {
        const jobs = await jobsCollection
          .find({ company_id: companyId })
          .toArray();

        if (jobs.length > 0) {
          res.status(200).json(jobs);
        } else {
          res.status(404).json({ message: "No jobs found for this company." });
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    app.get("/companies/top", async (req, res) => {
      try {
        const companies = await companiesCollection
          .find()
          .sort({ company_size: -1 })
          .limit(8)
          .toArray();
        res.json(companies);
      } catch (error) {
        console.error("Error fetching top companies:", error);
        res.status(500).json({ message: error.message });
      }
    });

    const currentDate = new Date();

    app.get("/jobs/advanced-search", async (req, res) => {
      const page = parseInt(req.query.page) || 0;
      const size = parseInt(req.query.size) || 10;
      const currentDateString = new Date().toISOString().split("T")[0];

      console.log("Advanced search endpoint hit");
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

      // console.log("salary range:", salaryRange);

      if (salaryRange && salaryRange.includes("-")) {
        const [minSalary, maxSalary] = salaryRange
          .replace(/\$/g, "")
          .split("-")
          .map(Number);

        // console.log(minSalary, maxSalary);

        if (!isNaN(minSalary) && !isNaN(maxSalary)) {
          query.salaryRange = {
            $regex: `^\\$(${minSalary}|[${
              minSalary + 1
            }-${maxSalary}][0-9]*|[1-9][0-9]{2,})-\\$${maxSalary}$`,
          };
        } else {
          console.error("Invalid salary range:", salaryRange);
        }
      }

      try {
        // console.log("Query:", query);
        // console.log("Advanced search endpoint hit");
        // console.log("Query:", JSON.stringify(query, null, 2));

        const totalJobs = await jobsCollection.countDocuments(query);

        const cursor = jobsCollection
          .find(query)
          .skip(page * size)
          .limit(size);
        const result = await cursor.toArray();
        res.json({ totalJobs, jobs: result });
        // console.log("Query Result:", result);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).send("Server Error");
      }
    });

    app.get("/jobs/search", async (req, res) => {
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
        console.error("Error fetching jobs:", error);
        res.status(500).send("Server Error");
      }
    });

    app.get("/companies", async (req, res) => {
      try {
        const page = parseInt(req.query.page) || 0;
        const size = parseInt(req.query.size) || 10;
        const searchTerm = req.query.searchTerm || "";

        const query = {};

        if (searchTerm) {
          query.company_name = { $regex: searchTerm, $options: "i" };
        }

        const totalCompanies = await companiesCollection.countDocuments(query);

        const companies = await companiesCollection
          .find(query)
          .skip(page * size)
          .limit(size)
          .toArray();

        res.json({
          totalCompanies,
          Companies: companies,
        });
      } catch (error) {
        console.error("Error fetching companies:", error);
        res.status(500).json({ message: "Server Error" });
      }
    });

    app.get("/companies/count", async (req, res) => {
      try {
        const count = await companiesCollection.countDocuments();
        res.json({ totalCompanies: count });
      } catch (error) {
        console.error("Error counting companies:", error);
        res.status(500).json({ message: error.message });
      }
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ messege: "User already exists", insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.get("/user-role", async (req, res) => {
      const email = req.query.email;
      // console.log("Called");
      // console.log("email", email);
      try {
        const user = await userCollection.findOne({ email });
        if (user) {
          return res.send({ role: user.role, id: user._id });
        } else {
          return res.status(404).send({ message: "User not found" });
        }
      } catch (error) {
        console.error("Error retrieving user role:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    app.get("/jobs/count", async (req, res) => {
      try {
        const count = await jobsCollection.countDocuments();
        res.json({ totalJobs: count });
      } catch (error) {
        console.error("Error counting jobs:", error);
        res.status(500).json({ message: error.message });
      }
    });

    app.get("/companies/count", async (req, res) => {
      try {
        const count = await companiesCollection.countDocuments();
        res.json({ totalCompanies: count });
      } catch (error) {
        console.error("Error counting companies:", error);
        res.status(500).json({ message: error.message });
      }
    });

    app.get("/jobs/company/:companyId", async (req, res) => {
      const { companyId } = req.params;
      // console.log("company id:", companyId);

      try {
        const jobs = await jobsCollection
          .find({ company_id: companyId })
          .toArray();
        // console.log(jobs);

        if (!jobs.length) {
          return res.status(404).send("No jobs found for this company");
        }

        res.json(jobs);
      } catch (error) {
        console.error("Error fetching jobs by company ID:", error);
        res.status(500).send("Server Error");
      }
    });

    app.get("/companies/:id", async (req, res) => {
      const { id } = req.params;

      try {
        const result = await companiesCollection.findOne({
          _id: new ObjectId(id),
        });
        if (!result) {
          return res.status(404).send("Company not found");
        }
        res.send(result);
      } catch (error) {
        console.error("Error fetching company by ID:", error);
        res.status(500).send("Server Error");
      }
    });

    app.post("/bookmarks", async (req, res) => {
      const { userEmail, jobId } = req.body;

      if (!userEmail || !jobId) {
        return res
          .status(400)
          .json({ message: "User ID and Job ID are required" });
      }

      try {
        const existingBookmark = await bookmarksCollection.findOne({
          userEmail,
          jobId,
        });

        if (existingBookmark) {
          return res.status(400).json({ message: "Job already bookmarked" });
        }
        const bookmark = { userEmail, jobId };
        const result = await bookmarksCollection.insertOne(bookmark);
        res
          .status(201)
          .json({ message: "Job bookmarked", id: result.insertedId });
      } catch (error) {
        console.error("Error adding bookmark:", error);
        res.status(500).json({ message: "Server Error" });
      }
    });

    app.get("/bookmarks/:userEmail", async (req, res) => {
      const { userEmail } = req.params;

      try {
        const bookmarks = await bookmarksCollection
          .find({ userEmail })
          .toArray();
        res.json(bookmarks);
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
        res.status(500).json({ message: "Server Error" });
      }
    });

    
    

    app.delete("/bookmarks/:email/:jobId", async (req, res) => {
      const { email, jobId } = req.params;

      try {
        const bookmark = await bookmarksCollection.findOne({
          userEmail: email,
          jobId,
        });

        if (!bookmark) {
          return res.status(404).json({ message: "Bookmark not found" });
        }

        await bookmarksCollection.deleteOne({ userEmail: email, jobId });

        res.status(200).json({ message: "Bookmark deleted successfully" });
      } catch (error) {
        console.error("Error deleting bookmark:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    app.get("/companies/search", async (req, res) => {
      const { searchTerm } = req.query;

      try {
        let query = {};
        if (searchTerm) {
          query = {
            company_name: { $regex: searchTerm, $options: "i" },
          };
        }

        const companies = await companiesCollection.find(query).toArray();
        res.json(companies);
      } catch (error) {
        console.error("Error searching companies:", error);
        res.status(500).json({ message: "Server Error" });
      }
    });

    app.get("/jobs/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const job = await jobsCollection.findOne({ _id: id });
        if (!job) {
          return res.status(404).send("Job not found");
        }
        res.json(job);
      } catch (error) {
        console.error("Error fetching job by ID:", error);
        res.status(500).send("Server Error");
      }
    });

    app.get("/jobs", async (req, res) => {
      try {
        const page = parseInt(req.query.page) || 0;
        const size = parseInt(req.query.size) || 10;
        const currentDate = new Date();

        // console.log("Current Date:", currentDate);

        const currentDateString = currentDate.toISOString().split("T")[0];
        const query = { deadline: { $gte: currentDateString } };

        const totalJobs = await jobsCollection.countDocuments(query);

        // console.log("Total Jobs Found:", totalJobs);

        const cursor = jobsCollection
          .find(query)
          .skip(page * size)
          .limit(size);
        const result = await cursor.toArray();

        // console.log("Jobs Result:", result);

        res.json({ totalJobs, jobs: result });
      } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).send("Server Error");
      }
    });

    app.post("/reviews", async (req, res) => {
      const newReviews = req.body;
      const result = await reviewsCollection.insertOne(newReviews);
      res.send(result);
    });

    // app.get("/reviews", async (req, res) => {
    //   const cursor = reviewsCollection.find();
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });

    app.get("/reviews", async (req, res) => {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 3; 
  
      const skip = (page - 1) * limit;
  
      const cursor = reviewsCollection.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
      const result = await cursor.toArray();
      const totalReviews = await reviewsCollection.countDocuments();
  
      res.send({
          reviews: result,
          totalPages: Math.ceil(totalReviews / limit),
          currentPage: page,
      });
  });


app.post("/sendMessage", async (req, res) => {
  const messageData = req.body;

  messageData.createdAt = new Date().toISOString(); 

  try {
    const result = await messagesCollection.insertOne(messageData);
    res.status(201).send(result);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

app.get('/messages/:receiverEmail/:senderEmail', async (req, res) => {
  const { receiverEmail, senderEmail } = req.params;
  console.log('receiverEmail',receiverEmail);
  console.log('senderEmail',senderEmail);

  try {
    const messages = await messagesCollection.find({
      $or: [
        { senderEmail: senderEmail, receiverEmail: receiverEmail },
        { senderEmail: receiverEmail, receiverEmail: senderEmail },
      ],
    }).sort({ createdAt: 1 }).toArray(); 

    if (messages.length > 0) {
      return res.status(200).json(messages); 
    } else {
      return res.status(404).json({ message: "No messages found." }); 
    }
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get('/user-details', async (req, res) => {
  const email = req.query.email;

  try {
    const user = await userCollection.findOne({ email }, 'name photoURL');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.get('/conversations', async (req, res) => {
  const currentUserEmail = req.query.email;
  try {
    const messages = await messagesCollection.find({
      $or: [
        { senderEmail: currentUserEmail },
        { receiverEmail: currentUserEmail },
      ],
    }).sort({ createdAt: 1 }).toArray(); 

    console.log('messages:',messages);

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error" });
  }
});


app.get('/individual-messages', async (req, res) => {
  const { email, otherPartyEmail } = req.query;
  console.log('email',email);
  console.log('other:',otherPartyEmail);

  try {
    const messagesAll = await messagesCollection.find({
      $or: [
        { senderEmail: email, receiverEmail: otherPartyEmail },
        { senderEmail: otherPartyEmail, receiverEmail: email },
      ],
    }).sort({ createdAt: 1 }); 

    const messages = await messagesAll.toArray(); 

    res.status(200).json(messages); 
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error" });
  }
});






    app.get("/single-job/:id", async (req, res) => {
      // console.log("API Called");
      const { id } = req.params;
      // console.log("Id:", id);

      // console.log("Jobs Collection:", jobsCollection);

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid Job ID" });
      }

      try {
        const result = await jobsCollection.findOne({ _id: id });
        // console.log("result:", result);

        if (!result) {
          return res.status(404).json({ error: "Job not found" });
        }

        res.json(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
      }
    });


    app.get("/all_jobs", async (req, res) => {
      try {
        const cursor = jobsCollection.find({}); 
        const result = await cursor.toArray(); 
        res.send(result); 
      } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).send({ message: "Failed to fetch jobs" });
      }
    });


    app.post("/apply_job", async (req, res) => {
      try {
        const application = req.body; 

        const result = await applicationsCollection.insertOne(application);

        res
          .status(201)
          .send({ message: "Application submitted successfully", result });
      } catch (error) {
        console.error("Error submitting application:", error);
        res.status(500).send({ message: "Failed to submit application" });
      }
    });

    app.get("/check_application", async (req, res) => {
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
        console.error("Error checking application:", error);
        res.status(500).send({ message: "Error checking application status" });
      }
    });

    app.get("/RelatedJobs", async (req, res) => {
      try {
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 6; 

        const skip = (page - 1) * limit; 
        const jobTitle = req.query.title; 
        console.log(jobTitle);
    
        const query = jobTitle ? { title: { $regex: jobTitle, $options: "i" } } : {};
    
        const jobs = await jobsCollection.find(query).skip(skip).limit(limit).toArray();
        
        const totalJobs = await jobsCollection.countDocuments(query);
        
        const totalPages = Math.ceil(totalJobs / limit);
    
        if (jobs.length === 0) {
          return res.status(404).send({ error: "No jobs found" });
        }
    
        res.send({
          jobs,
          currentPage: page,
          totalPages,
          totalJobs
        });

//         const skip = (page - 1) * limit;
//         const jobType = req.query.type; 
//         const query = jobType ? { jobType } : {}; 

//         const jobs = await jobsCollection
//           .find(query)
//           .skip(skip)
//           .limit(limit)
//           .toArray(); 
//         const totalJobs = await jobsCollection.countDocuments(query); 
//         const totalPages = Math.ceil(totalJobs / limit); 

//         if (jobs.length === 0) {
//           return res.status(404).send({ error: "No jobs found" }); 
//         }

//         res.send({ jobs, totalPages }); 

      } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).send({ error: "Internal server error" });
      }
    });



    app.get("/OpenPosition", async (req, res) => {
      try {
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 6; 
        const skip = (page - 1) * limit;
        const company_id = req.query.companyId; 

        const query = company_id ? { company_id } : {}; 

        const jobs = await jobsCollection
          .find(query)
          .skip(skip)
          .limit(limit)
          .toArray();

        const totalJobs = await jobsCollection.countDocuments(query); 
        const totalPages = Math.ceil(totalJobs / limit); 

        if (jobs.length === 0) {
          return res.status(404).send({ error: "No jobs found" }); 
        }

        res.send({ jobs, totalPages });
      } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).send({ error: "Internal server error" });
      }
    });

    console.log("Successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Jobify server");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
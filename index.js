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
    // await client.connect();

    // database and collection
    const database = client.db("jobifyDB");
    const companiesCollection = database.collection("companies");
    const jobsCollection = database.collection("jobs");
    const reviewsCollection = database.collection("reviews");
    const userCollection = database.collection("users");

    // company related API

    // get all companies
    app.get("/companies", async (req, res) => {
      const result = await companiesCollection.find().toArray();
      res.send(result);
    });

    // Get top Companies

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

    app.get("/jobs/search", async (req, res) => {
      const { searchTerm, location } = req.query;
      const query = {};

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

    app.get("/jobs/advanced-search", async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);

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
      const query = {};

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

      console.log("salary range:", salaryRange);

      if (salaryRange && salaryRange.includes("-")) {
        const [minSalary, maxSalary] = salaryRange
          .replace(/\$/g, "")
          .split("-")
          .map(Number);

        console.log(minSalary, maxSalary);

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
        console.log("Query:", query);
        console.log("Advanced search endpoint hit");
        console.log("Query:", JSON.stringify(query, null, 2));

        const totalJobs = await jobsCollection.countDocuments(query);

        const cursor = jobsCollection
          .find(query)
          .skip(page * size)
          .limit(size);
        const result = await cursor.toArray();
        res.json({ totalJobs, jobs: result });
        console.log("Query Result:", result);

        // res.send(result);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).send("Server Error");
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

    // Job Related API
    // get all jobs
    app.get("/jobs/all", async (req, res) => {
      const result = await jobsCollection.find().toArray();
      res.send(result);
    });

    app.get("/jobs", async (req, res) => {
      try {
        const page = parseInt(req.query.page);
        const size = parseInt(req.query.size);

        const totalJobs = await jobsCollection.countDocuments();

        const cursor = jobsCollection
          .find()
          .skip(page * size)
          .limit(size);
        const result = await cursor.toArray();

        res.json({ totalJobs, jobs: result });
      } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).send("Server Error");
      }
    });

    // get jobs for pagination
    app.get("/jobs/pagination", async (req, res) => {
      const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
      const limit = parseInt(req.query.limit) || 6; // Default limit is 6 jobs per page
      const skip = (page - 1) * limit;

      const jobs = await jobsCollection
        .find()
        .skip(skip)
        .limit(limit)
        .toArray();
      const totalJobs = await jobsCollection.countDocuments(); // Get total number of jobs
      const totalPages = Math.ceil(totalJobs / limit);

      res.send({ jobs, totalPages });
    });

    // get single job
    app.get("/job/:id", async (req, res) => {
      const { id } = req.params; // Get ID from request parameters
      try {
        const result = await jobsCollection.findOne({ _id: id }); // Treat _id as a string

        if (!result) {
          return res.status(404).send("Job not found");
        }

        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
      }
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    app.post("/reviews", async (req, res) => {
      const newReviews = req.body;
      const result = await reviewsCollection.insertOne(newReviews);
      res.send(result);
    });

    app.get("/reviews", async (req, res) => {
      const cursor = reviewsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
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

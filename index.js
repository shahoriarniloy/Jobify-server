const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dxgrzuk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    // strict: true,
    strict: false,

    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    // database and collection
    const database = client.db("jobifyDB");
    const companiesCollection = database.collection("companies");
    const jobsCollection = database.collection("jobs");


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
        res.status(500).json({ message: error.message });
      }
    });

    console.log("You successfully connected to MongoDB!");

    // Get Company by ID
    app.get("/companies/:id", async (req, res) => {
      const { id } = req.params; // Get ID from request parameters
      try {
        const result = await companiesCollection.findOne({
          _id: new ObjectId(id),
        });
        if (!result) {
          return res.status(404).send("company not found");
        }
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
      }
    });

    // Job Related API
    // get all jobs
    app.get("/jobs", async (req, res) => {
      const result = await jobsCollection.find().toArray();
      res.send(result);
    });

    // get single job
    app.get("/jobs/:id", async (req, res) => {
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

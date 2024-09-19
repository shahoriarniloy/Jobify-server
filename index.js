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
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nbrjeuw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const database = client.db("jobifyDB");
    const companiesCollection = database.collection("companies");
    const jobsCollection = database.collection("jobs");

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

    // get jobs
    app.get("/jobs", async (req, res) => {
      const result = await jobsCollection.find().toArray();
      res.send(result);
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

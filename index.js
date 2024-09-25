const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


  

app.use(
  cors({
      origin: [
          'http://localhost:5174', // React app's origin
      ],
      credentials: true, // if you need to send cookies or auth headers
  })
);





  
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dxgrzuk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    // strict: true,
    strict: false,

    deprecationErrors: true,
  }
});

async function run() {
  try {
   
    const database = client.db("jobifyDB");
    
    const jobCollection = database.collection('jobs');
    
    // POST API to insert job data into the database
    app.post('/postJob', async (req, res) => {
       const jobData = req.body;
       const result = await jobCollection.insertOne(jobData);
       res.send(result);
     });
       
    // GET API to fetch job data from the database
app.get('/jobs', async (req, res) => {
  const jobs = await jobCollection.find({}).toArray();
  res.send(jobs);
});

    
 
    
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
   
  }
}
run().catch(console.dir);

  
app.get('/',(req,res)=>{
    res.send('Jobify server')
});





app.listen(port,()=>{
    console.log(`Server is running on port: ${port}`);
})
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


  

app.use(
    cors({
        origin: [
            'http://localhost:5173', 
            ],
        credentials: true,
    }),
  )

  app.use(express.json());




  
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
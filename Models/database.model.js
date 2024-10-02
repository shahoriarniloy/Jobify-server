import { MongoClient, ServerApiVersion } from "mongodb";
import 'dotenv/config';

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dxgrzuk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: false,
    },
});


await client.connect();
const database = client.db("jobifyDB");

export const companiesCollection = database.collection("companies");
export const jobsCollection = database.collection("jobs");
export const reviewsCollection = database.collection("reviews");
export const userCollection = database.collection("users");
export const bookmarksCollection = database.collection("bookmarks");
export const jobCollection = database.collection("jobs");
export const applicationsCollection = database.collection("applications");

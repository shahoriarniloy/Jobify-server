
import express, { json } from "express";
import cors from "cors";
import UserRouter from "./Routes/user.route.js";
import companyRoute from "./Routes/company.route.js";
import jobRouter from "./Routes/job.route.js";
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
app.use(json());
app.use(UserRouter);
app.use(companyRoute);
app.use(jobRouter);


async function run() {
  try {
    console.log("Successfully connected to MongoDB!");
  } finally {
    app.get("/", (req, res) => {
      res.send("Jobify server");
    });
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
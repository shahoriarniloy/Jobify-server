import express from "express";
import { getDegrees, getFields, getSchoolName } from "../Controllers/other.controller.js";

const otherRouter = express.Router();

otherRouter.get("/school-name",getSchoolName);
otherRouter.get("/degrees",getDegrees)
otherRouter.get("/field",getFields)



export default otherRouter;
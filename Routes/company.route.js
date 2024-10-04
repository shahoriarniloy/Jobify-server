import express from 'express';
import { getCompanies, getCountingTotalCompanies, getCompaniesPostedJob, getTopCompanies, getSpecificCompany, searchCompany, openPosition } from '../Controllers/company.controller.js';

const companyRouter = express.Router();

// Get route
companyRouter.get("/companies-posted-job/:id", getCompaniesPostedJob);
companyRouter.get("/companies/top", getTopCompanies);
companyRouter.get("/companies", getCompanies);
companyRouter.get("/companies/count", getCountingTotalCompanies);
companyRouter.get("/companies/:email", getSpecificCompany);
companyRouter.get("/companies/search", searchCompany);
companyRouter.get("/OpenPosition", openPosition);

// Post Route


// Delete Route



// Update Route



export default companyRouter;
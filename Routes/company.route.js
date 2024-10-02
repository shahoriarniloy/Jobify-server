import express from 'express';
import { getCompanies, getCountingTotalCompanies, getCompaniesPostedJob, getTopCompanies, getSpecificCompany, searchCompany } from '../Controllers/company.controller.js';

const companyRouter = express.Router();

// Get route
companyRouter.get("/companies-posted-job/:id", getCompaniesPostedJob);
companyRouter.get("/companies/top", getTopCompanies);
companyRouter.get("/companies", getCompanies);
companyRouter.get("/companies/count", getCountingTotalCompanies);
companyRouter.get("/companies/:id", getSpecificCompany);
companyRouter.get("/companies/search", searchCompany);

// Post Route


// Delete Route



// Update Route



export default companyRouter;
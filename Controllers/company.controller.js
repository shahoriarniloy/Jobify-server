import { companiesCollection, jobsCollection } from "../Models/database.model.js";
import { ObjectId } from 'mongodb';

export const getCompaniesPostedJob = async (req, res) => {
    const companyId = req.params.id;
    console.log(companyId)

    try {
        const jobs = await jobsCollection
            .find({ company_id: companyId })
            .toArray();
        console.log(jobs)
        res.send(jobs)
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getTopCompanies = async (req, res) => {
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
}

export const getCompanies = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const size = parseInt(req.query.size) || 10;
        const searchTerm = req.query.searchTerm || "";

        const query = {};

        if (searchTerm) {
            query.company_name = { $regex: searchTerm, $options: "i" };
        }

        const totalCompanies = await companiesCollection.countDocuments(query);

        const companies = await companiesCollection
            .find(query)
            .skip(page * size)
            .limit(size)
            .toArray();

        res.json({
            totalCompanies,
            Companies: companies,
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}

export const getCountingTotalCompanies = async (req, res) => {
    try {
        const count = await companiesCollection.countDocuments();
        res.json({ totalCompanies: count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getSpecificCompany = async (req, res) => {
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
        res.status(500).send("Server Error");
    }
}

export const searchCompany = async (req, res) => {
    const { searchTerm } = req.query;
    try {
        let query = {};
        if (searchTerm) {
            query = {
                company_name: { $regex: searchTerm, $options: "i" },
            };
        }
        const companies = await companiesCollection.find(query).toArray();
        res.json(companies);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}


export const openPosition = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;
        const company_id = req.query.companyId;

        const query = company_id ? { company_id } : {};

        const jobs = await jobsCollection
            .find(query)
            .skip(skip)
            .limit(limit)
            .toArray();

        const totalJobs = await jobsCollection.countDocuments(query);
        const totalPages = Math.ceil(totalJobs / limit);

        if (jobs.length === 0) {
            return res.status(404).send({ error: "No jobs found" });
        }

        res.send({ jobs, totalPages });
    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).send({ error: "Internal server error" });
    }
}
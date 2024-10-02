import { jobCollection, jobsCollection } from "../Models/database.model.js";


export const postAJob = async (req, res) => {
    const jobData = req.body;
    try {
        const result = await jobCollection.insertOne(jobData);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
}

export const advanceSearch = async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 10;
    const currentDateString = new Date().toISOString().split("T")[0];
    const {
        searchTerm,
        location,
        experience,
        jobType,
        education,
        jobLevel,
        salaryRange,
    } = req.query;

    const query = {
        deadline: { $gte: currentDateString },
    };

    if (searchTerm) {
        query.$or = [
            { title: { $regex: searchTerm, $options: "i" } },
            { company: { $regex: searchTerm, $options: "i" } },
        ];
    }

    if (location && location.trim()) {
        query.location = { $regex: location, $options: "i" };
    }

    if (experience && experience.length > 0) {
        query.experience = { $in: experience.split(",") };
    }

    if (jobType && jobType.length > 0) {
        query.jobType = { $in: jobType.split(",") };
    }

    if (education && education.length > 0) {
        query.education = { $in: education.split(",") };
    }

    if (jobLevel && jobLevel.length > 0) {
        query.jobLevel = { $in: jobLevel.split(",") };
    }
    if (salaryRange && salaryRange.includes("-")) {
        const [minSalary, maxSalary] = salaryRange
            .replace(/\$/g, "")
            .split("-")
            .map(Number);
        if (!isNaN(minSalary) && !isNaN(maxSalary)) {
            query.salaryRange = {
                $regex: `^\\$(${minSalary}|[${minSalary + 1
                    }-${maxSalary}][0-9]*|[1-9][0-9]{2,})-\\$${maxSalary}$`,
            };
        }
    }

    try {
        const totalJobs = await jobsCollection.countDocuments(query);

        const cursor = jobsCollection
            .find(query)
            .skip(page * size)
            .limit(size);
        const result = await cursor.toArray();
        res.json({ totalJobs, jobs: result });
    } catch (error) {
        res.status(500).send("Server Error");
    }
}

export const searchLocation = async (req, res) => {
    const { searchTerm, location } = req.query;
    const currentDateString = new Date().toISOString().split("T")[0];

    const query = {
        deadline: { $gte: currentDateString },
    };

    if (searchTerm) {
        query.$or = [
            { title: { $regex: searchTerm, $options: "i" } },
            { company: { $regex: searchTerm, $options: "i" } },
        ];
    }

    if (location) {
        query.location = { $regex: location, $options: "i" };
    }

    try {
        if (!searchTerm && !location) {
            return res.json([]);
        }

        const result = await jobsCollection.find(query).toArray();
        res.send(result);
    } catch (error) {
        res.status(500).send("Server Error");
    }
}

export const getSpecificJob = async (req, res) => {
    const { id } = req.params;
    try {
        const job = await jobsCollection.findOne({ _id: id });
        if (!job) {
            return res.status(404).send("Job not found");
        }
        res.json(job);
    } catch (error) {
        res.status(500).send("Server Error");
    }
}

export const getAllJobsCounts = async (req, res) => {
    try {
        const count = await jobsCollection.countDocuments();
        res.json({ totalJobs: count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getAllJobs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const size = parseInt(req.query.size) || 10;
        const currentDate = new Date();

        const currentDateString = currentDate.toISOString().split("T")[0];
        const query = { deadline: { $gte: currentDateString } };
        const totalJobs = await jobsCollection.countDocuments(query);
        const cursor = jobsCollection
            .find(query)
            .skip(page * size)
            .limit(size);
        const result = await cursor.toArray();
        res.json({ totalJobs, jobs: result });
    } catch (error) {
        res.status(500).send("Server Error");
    }
};

export const applyAJob = async (req, res) => {
    try {
        const application = req.body;
        const result = await applicationsCollection.insertOne(application);
        res
            .status(201)
            .send({ message: "Application submitted successfully", result });
    } catch (error) {
        res.status(500).send({ message: "Failed to submit application" });
    }
}
export const checkAlreadyApplied = async (req, res) => {
    const { job_id, user_email } = req.query;
    try {
        const application = await applicationsCollection.findOne({
            job_id,
            user_email,
        });

        if (application) {
            res.status(200).send({ applied: true });
        } else {
            res.status(200).send({ applied: false });
        }
    } catch (error) {
        res.status(500).send({ message: "Error checking application status" });
    }
}

export const getPostedJobs = async (req, res) => {
    const companyId = req.params.id;
    try {
        const jobs = await jobsCollection
            .find({ company_id: companyId })
            .toArray();

        if (jobs.length > 0) {
            res.status(200).json(jobs);
        } else {
            res.status(404).json({ message: "No jobs found for this company." });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}


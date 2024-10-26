import {
  companiesCollection,
  jobsCollection,
} from "../Models/database.model.js";
import { ObjectId } from "mongodb";

export const getCompaniesPostedJob = async (req, res) => {
  const companyId = req.params.id;

  try {
    const jobs = await jobsCollection.find({ company_id: companyId }).toArray();
    res.send(jobs);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

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
};

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
};

// export const getCountingTotalCompanies = async (req, res) => {
//   try {
//     const count = await companiesCollection.countDocuments();
//     res.json({ totalCompanies: count });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const getSpecificCompany = async (req, res) => {
  const { email } = req.params;
  try {
    const result = await companiesCollection.findOne({
      email: email,
    });
    if (!result) {
      return res.status(404).send("Company not found");
    }
    res.send(result);
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

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
};

export const openPosition = async (req, res) => {
  const company_email = req.query.email;
  const query = { "companyInfo.email": company_email };
  const jobs = await jobsCollection.find(query).toArray();

  res.send(jobs);
};

export const companyInfo = async (req, res) => {
  const { companyName, aboutUs, logoUrl, bannerUrl, email } = req.body;

  const companyData = {
    company_name: companyName,
    company_logo: logoUrl,
    company_banner: bannerUrl,
    company_description: aboutUs,
    email: email,
  };

  try {
    const existingCompany = await companiesCollection.findOne({
      email: email,
    });

    if (existingCompany) {
      const result = await companiesCollection.updateOne(
        { email: email },
        { $set: companyData }
      );

      res.status(200).json({
        message: "Company info updated successfully",
        result,
      });
    } else {
      companyData._id = new ObjectId();
      const result = await companiesCollection.insertOne(companyData);

      res.status(201).json({
        message: "Company info saved successfully",
        result,
      });
    }
  } catch (error) {
    // console.error("Error saving company info:", error);
    res.status(500).json({
      message: "Failed to save company info",
      error: error.message,
    });
  }
};

export const companyFoundingInfo = async (req, res) => {
  const {
    organizationType,
    industryType,
    teamSize,
    establishmentYear,
    website,
    companyVision,
    email,
  } = req.body;

  try {
    const existingCompany = await companiesCollection.findOne({ email: email });

    if (existingCompany) {
      const updatedCompanyData = {
        company_type: organizationType,
        industry: industryType,
        company_size: teamSize,
        founded_date: establishmentYear,
        company_website: website,
        company_vision: companyVision,
      };

      const result = await companiesCollection.updateOne(
        { email: email },
        { $set: updatedCompanyData }
      );

      return res.status(200).json({
        message: "Company info updated successfully",
        result,
      });
    } else {
      const newCompanyData = {
        _id: new ObjectId(),
        company_type: organizationType,
        industry: industryType,
        company_size: teamSize,
        founded_date: establishmentYear,
        company_website: website,
        company_vision: companyVision,
        email: email,
      };

      const result = await companiesCollection.insertOne(newCompanyData);

      return res.status(201).json({
        message: "Company info saved successfully",
        result,
      });
    }
  } catch (error) {
    // console.error(error);
    return res.status(500).json({ message: "Error saving company info" });
  }
};

export const companySocialInfo = async (req, res) => {
  const { email, socialMediaLinks } = req.body;

  if (!email || !socialMediaLinks) {
    return res
      .status(400)
      .json({ message: "Email and social media links are required" });
  }

  try {
    const existingCompany = await companiesCollection.findOne({ email: email });

    if (!existingCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    const result = await companiesCollection.updateOne(
      { email: email },
      { $set: { social_media_links: socialMediaLinks } },
      { upsert: true }
    );

    res
      .status(200)
      .json({ message: "Social media links saved successfully", result });
  } catch (error) {
    // console.error("Error saving social media links:", error);
    res.status(500).json({ message: "Error saving social media links", error });
  }
};

export const companyAccountInfo = async (req, res) => {
  const { email, phone, formattedLocation } = req.body;

  if (!email || !phone || !formattedLocation) {
    return res
      .status(400)
      .json({ message: "Email and phone number are required" });
  }
  console.log(formattedLocation);

  try {
    const existingUser = await companiesCollection.findOne({ email: email });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = await companiesCollection.updateOne(
      { email: email },
      { $set: { phone: phone, location: formattedLocation } },
      { upsert: false }
    );

    if (result.modifiedCount === 0) {
      return res
        .status(400)
        .json({ message: "No changes made to account information" });
    }

    res
      .status(200)
      .json({ message: "Account information updated successfully", result });
  } catch (error) {
    // console.error("Error updating account information:", error);
    res
      .status(500)
      .json({ message: "Error updating account information", error });
  }
};

export const deleteCompany = async (req, res) => {
  const { email } = req.params;

  try {
    const result1 = await userCollection.deleteOne({ email: email });
    const result2 = await companiesCollection.deleteOne({ email: email });

    if (result1.deletedCount === 1 && result2.deletedCount === 1) {
      res.status(200).json({ message: "Job seeker deleted successfully." });
    } else {
      res.status(404).json({ message: "Job seeker not found." });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

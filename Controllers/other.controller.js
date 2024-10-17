import { educationsDegree, schoolName } from "../Models/database.model.js";

export const getSchoolName = async (req, res) => {
  const query = req.query.name;
  const result = await schoolName
    .find(query ? { name: { $regex: query, $options: "i" } } : {})
    .toArray();
  res.send(result);
};

export const getDegrees = async (req, res) => {
  const result = await educationsDegree.find().toArray();
  res.send(result);
};
export const getFields = async (req, res) => {
  const query = req.query.field;
  const result = await educationsDegree.findOne({ degree: query });
  res.send(result);
};

import { reviewsCollection, userCollection } from './../Models/database.model.js';


export const createUser = async (req, res) => {
    const user = req.body;
    const query = { email: user.email };
    const existingUser = await userCollection.findOne(query);
    if (existingUser) {
        return res.send({ messege: "User already exists", insertedId: null });
    }
    const result = await userCollection.insertOne(user);
    res.send(result);
}

export const getUserRole = async (req, res) => {
    const email = req.query.email;
    try {
        const user = await userCollection.findOne({ email });
        if (user) {
            return res.send({ role: user.role, id: user._id });
        } else {
            return res.status(404).send({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).send({ message: "Internal server error" });
    }
}

export const getUserBookmark = async (req, res) => {
    const { userEmail } = req.params;
    try {
        const bookmarks = await bookmarksCollection
            .find({ userEmail })
            .toArray();
        res.json(bookmarks);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}

export const createUserBookmark = async (req, res) => {
    const { userEmail, jobId } = req.body;

    if (!userEmail || !jobId) {
        return res
            .status(400)
            .json({ message: "User ID and Job ID are required" });
    }

    try {
        const existingBookmark = await bookmarksCollection.findOne({
            userEmail,
            jobId,
        });

        if (existingBookmark) {
            return res.status(400).json({ message: "Job already bookmarked" });
        }
        const bookmark = { userEmail, jobId };
        const result = await bookmarksCollection.insertOne(bookmark);
        res
            .status(201)
            .json({ message: "Job bookmarked", id: result.insertedId });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}

export const deleteUserBookmark = async (req, res) => {
    const { email, jobId } = req.params;

    try {
        const bookmark = await bookmarksCollection.findOne({
            userEmail: email,
            jobId,
        });

        if (!bookmark) {
            return res.status(404).json({ message: "Bookmark not found" });
        }

        await bookmarksCollection.deleteOne({ userEmail: email, jobId });

        res.status(200).json({ message: "Bookmark deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

export const postReview = async (req, res) => {
    const newReviews = req.body;
    const result = await reviewsCollection.insertOne(newReviews);
    res.send(result);
}

export const getAllReview = async (req, res) => {
    const cursor = reviewsCollection.find();
    const result = await cursor.toArray();
    res.send(result);
}
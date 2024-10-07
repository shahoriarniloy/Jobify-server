import { applicationsCollection, bookmarksCollection, messagesCollection, reviewsCollection, userCollection } from './../Models/database.model.js';


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
    const email = req.query?.email;
    
        const user = await userCollection.findOne({ email:email });
        if (user) {
            return res.send(user?.role);
        } else {
            return res.status(404).send({ message: "User not found" });
        }
}



// export const getUserBookmark = async (req, res) => {
//     const email = req.query?.email;
//     try {
//         const bookmarks = await bookmarksCollection
//             .find({ userEmail:email})
//             .toArray();
//         res.send(bookmarks);
//     } catch (error) {
//         res.status(500).json({ message: "Server Error" });
//     }
// }
export const getUserBookmark = async (req, res) => {
    // console.log('called');
    const { email } = req.query;
    // console.log('Received email:', email);

      try {
        const bookmarks = await bookmarksCollection
          .find({ userEmail: email })
          .toArray();

        //   console.log(bookmarks);
        res.json(bookmarks);
      } catch (error) {
        // console.error("Error fetching bookmarks:", error);
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

// export const getAllReview = async (req, res) => {
//     const cursor = reviewsCollection.find();
//     const result = await cursor.toArray();
//     // console.log(result);
//     res.send(result);
// }

export const getAllReview = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3; 

    const skip = (page - 1) * limit;

    const cursor = reviewsCollection.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    const result = await cursor.toArray();
    const totalReviews = await reviewsCollection.countDocuments();

    res.send({
        reviews: result,
        totalPages: Math.ceil(totalReviews / limit),
        currentPage: page,
    });
}






export const checkJobAlreadyApplied = async (req, res) => {
    const email = req.query?.email;
    const jobId = req.query?.jobid;

    const findQuery = {
        user_email: email,
        job_id: jobId
    }

    const result = await applicationsCollection.findOne(findQuery.$);
    if (result?.candidate_id) {
        res.send({ verification: true })
    }


}

export const sendMessage = async (req, res) => {
    const messageData = req.body;

    messageData.createdAt = new Date().toISOString();

    try {
        const result = await messagesCollection.insertOne(messageData);
        res.status(201).send(result);
    } catch (error) {
        // console.error("Error sending message:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
}


export const getMessage = async (req, res) => {
    const { receiverEmail, senderEmail } = req.params;
    // console.log('receiverEmail', receiverEmail);
    // console.log('senderEmail', senderEmail);

    try {
        const messages = await messagesCollection.find({
            $or: [
                { senderEmail: senderEmail, receiverEmail: receiverEmail },
                { senderEmail: receiverEmail, receiverEmail: senderEmail },
            ],
        }).sort({ createdAt: 1 }).toArray();

        if (messages.length > 0) {
            return res.status(200).json(messages);
        } else {
            return res.status(404).json({ message: "No messages found." });
        }
    } catch (error) {
        // console.error("Error fetching messages:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const userDetails = async (req, res) => {
    const email = req.query.email;

    try {
        const user = await userCollection.findOne({ email }, 'name photoURL');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        // console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// export const userConversion = async (req, res) => {
//     const currentUserEmail = req.query.email;
//     try {
//         const messages = await messagesCollection.find({
//             $or: [
//                 { senderEmail: currentUserEmail },
//                 { receiverEmail: currentUserEmail },
//             ],
//         }).sort({ createdAt: 1 }).toArray();

//         // console.log('messages:', messages);

//         res.status(200).json(messages);
//     } catch (error) {
//         // console.error("Error fetching messages:", error);
//         res.status(500).json({ message: "Server error" });
//     }
// }


export const userConversion = async (req, res) => {
    const currentUserEmail = req.query.email;
    try {
        const messages = await messagesCollection.aggregate([
            {
                $match: {
                    $or: [
                        { senderEmail: currentUserEmail },
                        { receiverEmail: currentUserEmail },
                    ],
                },
            },
            {
                $sort: { createdAt: -1 }, 
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $eq: ['$senderEmail', currentUserEmail] },
                            then: '$receiverEmail', 
                            else: '$senderEmail', 
                        },
                    },
                    latestMessage: { $first: '$$ROOT' }, 
                },
            },
            {
                $replaceRoot: { newRoot: '$latestMessage' }, 
            },
            {
                $sort: { createdAt: -1 }, 
            },
        ]).toArray();


        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}


export const individualMessage = async (req, res) => {
    const { email, otherPartyEmail } = req.query;
    // console.log('email', email);
    // console.log('other:', otherPartyEmail);

    try {
        const messagesAll = await messagesCollection.find({
            $or: [
                { senderEmail: email, receiverEmail: otherPartyEmail },
                { senderEmail: otherPartyEmail, receiverEmail: email },
            ],
        }).sort({ createdAt: 1 });

        const messages = await messagesAll.toArray();

        res.status(200).json(messages);
    } catch (error) {
        // console.error("Error fetching messages:", error);
        res.status(500).json({ message: "Server error" });
    }
}
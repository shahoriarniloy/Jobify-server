import {
  applicationsCollection,
  bookmarksCollection,
  messagesCollection,
  reviewsCollection,
  userCollection,
  jobsCollection,
  postsCollection,
  followingsCollection,
  companiesCollection,
} from "./../Models/database.model.js";
import { ObjectId } from "mongodb";

export const createUser = async (req, res) => {
  const user = req.body;
  const query = { email: user.email };
  const existingUser = await userCollection.findOne(query);
  if (existingUser) {
    return res.send({ messege: "User already exists", insertedId: null });
  }
  const result = await userCollection.insertOne(user);
  res.send(result);
};

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
};

export const searchJobSeekers = async (req, res) => {
  const { searchTerm } = req.query;

  let query = { role: "Job Seeker" };
  if (searchTerm) {
    query = {
      ...query,
      name: { $regex: searchTerm, $options: "i" },
    };
  }
  const jobSeekers = await userCollection.find(query).toArray();
  res.json(jobSeekers);
};

export const followJobSeeker = async (req, res) => {
  console.log("called");
  const { followerEmail, followedEmail } = req.body;
  console.log(followerEmail);
  console.log(followerEmail);

  const existingFollow = await followingsCollection.findOne({
    follower: followerEmail,
    followed: followedEmail,
  });

  if (existingFollow) {
    return res.status(400).json({ message: "Already following this user." });
  }

  const followData = {
    follower: followerEmail,
    followed: followedEmail,
    followedAt: new Date(),
  };

  await followingsCollection.insertOne(followData);
  res.status(200).json({ message: "Followed successfully!" });
};

export const unfollowJobSeeker = async (req, res) => {
  const { followerEmail, followedEmail } = req.body;

  const existingFollow = await followingsCollection.findOneAndDelete({
    follower: followerEmail,
    followed: followedEmail,
  });

  if (!existingFollow) {
    return res
      .status(400)
      .json({ message: "You are not following this user." });
  }

  res.status(200).json({ message: "Unfollowed successfully!" });
};

export const checkFollowStatus = async (req, res) => {
  try {
    const { followerEmail, followedEmail } = req.query;

    console.log("Follower Email:", followerEmail);
    console.log("Followed Email:", followedEmail);

    if (!followerEmail || !followedEmail) {
      return res.status(400).json({
        message: "Both followerEmail and followedEmail are required.",
      });
    }

    const existingFollow = await followingsCollection.findOne({
      follower: followerEmail,
      followed: followedEmail,
    });

    console.log("Existing Follow:", existingFollow);

    res.status(200).json({ hasFollowed: !!existingFollow });
  } catch (error) {
    console.error("Error checking follow status:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

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
  const { email } = req.query;

  try {
    const bookmarks = await bookmarksCollection
      .find({ userEmail: email })
      .toArray();

    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const createUserBookmark = async (req, res) => {
  const { userEmail, jobId } = req.body;

  if (!userEmail || !jobId) {
    return res.status(400).json({ message: "User ID and Job ID are required" });
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
    res.status(201).json({ message: "Job bookmarked", id: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

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
};

export const postStatus = async (req, res) => {
  const { userEmail, userName, userPhoto, content, imageUrl } = req.body;

  const newPost = {
    userEmail,
    userName,
    userPhoto,
    content,
    imageUrl,
    likes: [],
    comments: [],
    createdAt: new Date(),
  };

  const result = await postsCollection.insertOne(newPost);
  res.send(result);
};

export const postReview = async (req, res) => {
  const newReviews = req.body;
  const result = await reviewsCollection.insertOne(newReviews);
  res.send(result);
};

export const postLike = async (req, res) => {
  const postId = req.params.postId;
  const { userEmail } = req.body;
  if (!userEmail) {
    return res.status(400).json({ message: "User email is required." });
  }

  const post = await postsCollection.findOne({ _id: new ObjectId(postId) });
  if (!post) {
    return res.status(404).json({ message: "Post not found." });
  }

  if (!post.likes.includes(userEmail)) {
    post.likes.push(userEmail);

    const result = await postsCollection.updateOne(
      { _id: new ObjectId(postId) },
      { $set: { likes: post.likes } }
    );

    res.status(200).json({ message: "Post liked", result });
  } else {
    res.status(400).json({ message: "You already liked this post" });
  }
};

export const postUnlike = async (req, res) => {
  const postId = req.params.postId;
  const { userEmail } = req.body;

  if (!userEmail) {
    return res.status(400).json({ message: "User email is required." });
  }

  const post = await postsCollection.findOne({ _id: new ObjectId(postId) });

  if (!post) {
    return res.status(404).json({ message: "Post not found." });
  }

  console.log("User Email:", userEmail);

  const index = post.likes.indexOf(userEmail);
  if (index !== -1) {
    post.likes.splice(index, 1);

    const result = await postsCollection.updateOne(
      { _id: new ObjectId(postId) },
      { $set: { likes: post.likes } }
    );

    res.status(200).json({ message: "Post unliked", result });
  } else {
    res.status(400).json({ message: "You have not liked this post" });
  }
};

export const postComment = async (req, res) => {
  const { userEmail, userPhoto, userName, comment } = req.body;
  const post = await postsCollection.findOne({
    _id: new ObjectId(req.params.postId),
  });

  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const user = {
    userEmail,
    userPhoto,
    userName,
    userPhoto,
  };

  post.comments.push({ ...user, comment });

  await postsCollection.updateOne(
    { _id: new ObjectId(req.params.postId) },
    { $set: { comments: post.comments } }
  );

  res.status(201).json({ message: "Comment added", post });
};

export const getPosts = async (req, res) => {
  try {
    const posts = await postsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Error fetching posts" });
  }
};

export const getPost = async (req, res) => {
  const { postId } = req.params;

  const post = await postsCollection.findOne({ _id: new ObjectId(postId) });

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  res.status(200).json(post);
};

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

  const cursor = reviewsCollection
    .find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const result = await cursor.toArray();
  const totalReviews = await reviewsCollection.countDocuments();

  res.send({
    reviews: result,
    totalPages: Math.ceil(totalReviews / limit),
    currentPage: page,
  });
};

export const checkJobAlreadyApplied = async (req, res) => {
  const email = req.query?.email;
  const jobId = req.query?.jobid;

  const findQuery = {
    user_email: email,
    job_id: jobId,
  };

  const result = await applicationsCollection.findOne(findQuery.$);
  if (result?.candidate_id) {
    res.send({ verification: true });
  }
};

export const checkAppliedJobs = async (req, res) => {
  const email = req.query?.email;

  const applications = await applicationsCollection
    .find({ user_email: email })
    .toArray();

  const appliedJobsWithDetails = [];

  for (const application of applications) {
    const job = await jobsCollection.findOne({
      _id: new ObjectId(application.job_id),
    });
    if (job) {
      appliedJobsWithDetails.push({
        _id: application._id,
        user_email: application.user_email,
        status: application.status,
        job_id: application.job_id,
        title: job.title,
        company: job.company,
        salaryRange: job.salaryRange,
        location: job.location,
      });
    }
  }

  res.send(appliedJobsWithDetails);
};

// export const sendMessage = async (req, res) => {
//   const messageData = req.body;

//   messageData.createdAt = new Date().toISOString();

//   try {
//     const result = await messagesCollection.insertOne(messageData);
//     res.status(201).send(result);
//   } catch (error) {
//     res.status(500).send({ message: "Internal Server Error" });
//   }
// };

export const sendMessage = async (req, res) => {
  const messageData = req.body;

  messageData.createdAt = new Date().toISOString();

  try {
    const company = await companiesCollection.findOne({
      email: messageData.receiverEmail,
    });

    if (company) {
      messageData.receiverName = company.company_name;
      messageData.receiverPhoto = company.company_logo;
    } else {
      return res.status(404).send({ message: "Receiver not found." });
    }

    const result = await messagesCollection.insertOne(messageData);
    res.status(201).send(result);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export const getMessage = async (req, res) => {
  const { receiverEmail, senderEmail } = req.params;

  try {
    const messages = await messagesCollection
      .find({
        $or: [
          { senderEmail: senderEmail, receiverEmail: receiverEmail },
          { senderEmail: receiverEmail, receiverEmail: senderEmail },
        ],
      })
      .sort({ createdAt: 1 })
      .toArray();

    if (messages.length > 0) {
      return res.status(200).json(messages);
    } else {
      return res.status(404).json({ message: "No messages found." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const userDetails = async (req, res) => {
  const email = req.query.email;

  try {
    const user = await userCollection.findOne({ email }, "name photoURL");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

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
    const messages = await messagesCollection
      .aggregate([
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
                if: { $eq: ["$senderEmail", currentUserEmail] },
                then: "$receiverEmail",
                else: "$senderEmail",
              },
            },
            latestMessage: { $first: "$$ROOT" },
          },
        },
        {
          $replaceRoot: { newRoot: "$latestMessage" },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray();

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const individualMessage = async (req, res) => {
  const { email, otherPartyEmail } = req.query;

  try {
    const messagesAll = await messagesCollection
      .find({
        $or: [
          { senderEmail: email, receiverEmail: otherPartyEmail },
          { senderEmail: otherPartyEmail, receiverEmail: email },
        ],
      })
      .sort({ createdAt: 1 });

    const messages = await messagesAll.toArray();

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

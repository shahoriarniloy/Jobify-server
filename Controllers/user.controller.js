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
  resumesCollection,
  careersCollection,
} from "./../Models/database.model.js";
import { ObjectId } from "mongodb";

export const createUser = async (req, res) => {
  const user = req.body;
  const query = { email: user.email };
  const result = await userCollection.insertOne(user);
  res.send(result);
};

export const getUserRole = async (req, res) => {
  const email = req.query?.email;
  const user = await userCollection.findOne({ email });
  if (user) {
    return res.send(user?.role);
  } else {
    return res.status(404).send({ message: "User not found" });
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
  const { followerEmail, followedEmail } = req.body;

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

    if (!followerEmail || !followedEmail) {
      return res.status(400).json({
        message: "Both followerEmail and followedEmail are required.",
      });
    }

    const existingFollow = await followingsCollection.findOne({
      follower: followerEmail,
      followed: followedEmail,
    });

    // console.log("Existing Follow:", existingFollow);

    res.status(200).json({ hasFollowed: !!existingFollow });
  } catch (error) {
    // console.error("Error checking follow status:", error);
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
  const { currentUserEmail } = req.query;

  try {
    const followings = await followingsCollection
      .find({ follower: currentUserEmail })
      .toArray();

    const followedEmails = followings.map((follow) => follow.followed);

    const posts = await postsCollection
      .find({ userEmail: { $in: followedEmails } })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    res.status(200).json(posts);
  } catch (error) {
    // console.error("Error fetching posts:", error);
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

export const sendMessage = async (req, res) => {
  const messageData = req.body;

  messageData.createdAt = new Date().toISOString();

  try {
    const user = await userCollection.findOne({
      email: messageData.receiverEmail,
    });

    const company = await companiesCollection.findOne({
      email: messageData.receiverEmail,
    });

    if (user) {
      messageData.receiverName = user.name;
      messageData.receiverPhoto = user.photoURL;
    } else if (company) {
      messageData.receiverName = company.company_name;
      messageData.receiverPhoto = company.company_logo;
    } else {
      return res.status(404).send({ message: "Receiver not found." });
    }

    const result = await messagesCollection.insertOne(messageData);
    res.status(201).send(result);
  } catch (error) {
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

export const postProfileSettings = async (req, res) => {
  try {
    const {
      userEmail,
      schoolName,
      degree,
      field,
      startDate,
      endDate,
      cgpa,
      description,
    } = req.body;
    const query = { email: userEmail };

    const educationData = {
      schoolName,
      degree,
      field,
      startDate,
      endDate,
      cgpa,
      description,
    };
    const update = { $push: { education: educationData } };
    const result = await userCollection.updateOne(query, update);
    const resume = await resumesCollection.updateOne(query, update);

    if (result.modifiedCount === 1) {
      res.status(200).json({ message: "Education data added successfully" });
    } else {
      res.status(400).json({ message: "Profile not found or no changes made" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const postUserInfo = async (req, res) => {
  try {
    const { about, phone, photoUrl, email, socialLinks } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const update = { $set: {} };

    if (photoUrl) update.$set.photoURL = photoUrl;
    if (about) update.$set["userInfo.0.about"] = about;
    if (phone) update.$set["userInfo.0.phone"] = phone;
    if (socialLinks && Array.isArray(socialLinks)) {
      update.$set["userInfo.0.socialLinks"] = socialLinks;
    }

    if (Object.keys(update.$set).length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const result = await userCollection.updateOne({ email }, update);

    if (result.modifiedCount === 1) {
      res.status(200).json({ message: "Profile updated successfully" });
    } else {
      res.status(400).json({ message: "Profile not found or no changes made" });
    }
  } catch (error) {
    // console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserByEmail = async (req, res) => {
  const { email } = req.params;

  try {
    const user = await userCollection.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    // console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getResumeByEmail = async (req, res) => {
  const { email } = req.params;

  const resume = await resumesCollection.findOne({ email });

  if (!resume) {
    return res.status(404).json({ message: "Resume not found" });
  }

  res.status(200).json(resume);
};

export const createOrUpdateResume = async (req, res) => {
  const { email, ...resumeData } = req.body;

  try {
    const existingResume = await resumesCollection.findOne({ email });

    if (existingResume) {
      const { _id, ...updateData } = resumeData;
      // console.log(resumeData);

      const updatedResume = await resumesCollection.findOneAndUpdate(
        { email },
        { $set: updateData },
        { new: true }
      );

      return res
        .status(200)
        .json({ message: "Resume updated successfully", updatedResume });
    } else {
      const newResume = await resumesCollection.insertOne({
        email,
        ...resumeData,
      });

      return res
        .status(201)
        .json({ message: "New resume created successfully", newResume });
    }
  } catch (error) {
    // console.error("Error saving resume:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getCareerSuggestions = async (req, res) => {
  try {
    const skills = req.body.skills || [];

    if (skills.length === 0) {
      return res.status(400).json({ message: "No skills provided." });
    }

    const careers = await careersCollection
      .find({
        requiredSkills: { $in: skills },
      })
      .toArray();

    if (!careers.length) {
      return res
        .status(200)
        .json({ message: "No career suggestions found.", careers: [] });
    }

    res.status(200).json(careers);
  } catch (error) {
    // console.error("Error fetching career suggestions:", error);
    res
      .status(500)
      .json({ message: "Error fetching career suggestions.", error });
  }
};

export const getJobCountsByEmail = async (req, res) => {
  const { email } = req.params;
  // console.log(email);

  try {
    const appliedJobsCount = await applicationsCollection.countDocuments({
      user_email: email,
    });

    const favoriteJobsCount = await bookmarksCollection.countDocuments({
      userEmail: email,
    });

    res.status(200).json({
      appliedJobsCount,
      favoriteJobsCount,
    });
  } catch (error) {
    // console.error("Error fetching job counts:", error);
    res.status(500).json({ message: "Error fetching job counts" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await userCollection.find().toArray();

    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getFavoriteCompanies = async (req, res) => {
  const { userEmail } = req.params;

  try {
    const user = await userCollection.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    // If there are no favorite companies
    if (!user.favoriteCompany || user.favoriteCompany.length === 0) {
      return res.status(200).json({ favoriteCompanies: [] });
    }

    // return the list of favorite companies
    return res.status(200).json({ favoriteCompanies: user.favoriteCompany });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const addFavoriteCompany = async (req, res) => {
  const { companyEmail } = req.body;
  const { userEmail } = req.params;

  try {
    // Use findOneAndUpdate for atomic operation
    const user = await userCollection.findOneAndUpdate(
      { email: userEmail, favoriteCompany: { $ne: companyEmail } }, // Check that company is not already in favorites
      { $addToSet: { favoriteCompany: companyEmail } },
      { new: true } // Return the updated document
    );

    if (!user)
      return res
        .status(404)
        .json({ message: "User not found or company already in favorite" });

    res.status(200).json({ message: "Company added to favorites" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteFavoriteCompany = async (req, res) => {
  const { userEmail, companyEmail } = req.params;

  try {
    const user = await userCollection.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Remove company from favorites
    await userCollection.updateOne(
      { email: userEmail },
      { $pull: { favoriteCompany: companyEmail } }
    );
    res.status(200).json({ message: "Company removed from favorites" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "server error" });
  }
};

export const checkIsFavorite = async (req, res) => {
  const { email, companyEmail } = req.params; // Fix destructuring

  try {
    const user = await userCollection.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the companyEmail is in the user's favoriteCompany array
    const isFavorite = user.favoriteCompany.includes(companyEmail);
    res.json({ isFavorite });
  } catch (error) {
    console.error("Error checking favorite company:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLatestJobsForUser = async (req, res) => {
  const { userEmail } = req.params; // Fix destructuring

  try {
    // Fetch the favorite companies first
    const user = await userCollection.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Get the favorite companies
    const favoriteCompanies = user.favoriteCompany || [];

    // If there are no favorite companies
    if (favoriteCompanies.length === 0)
      return res.status(200).json({ jobs: [] }); // No jobs found

    // Fetch the latest jobs from the favorite companies
    const latestJobs = await jobsCollection
      .find({ "companyInfo.email": { $in: favoriteCompanies } }) // Filter jobs by hrEmail matching favorite companies
      .sort({ "companyInfo.posted": -1 }) // Sort by posted time in descending order
      .toArray(); // Convert to array

    return res.status(200).json({ jobs: latestJobs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

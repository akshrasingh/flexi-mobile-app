const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = 3000;
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const jwt = require("jsonwebtoken");
console.log("MongoDB URI:", process.env.MONGODB_URI);
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to mongoDB");
  })
  .catch((err) => {
    console.log("Error Connecting to MongoDB", err);
  });
app.listen(port, () => {
  console.log(`server listens on port ${port}`);
});

const User = require("./models/user");
const Tweet = require("./models/post");

//endpoint to register a user in the backend
app.post("/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    //check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Email already registered");
      return res.status(400).json({ message: "Email already registered" });
    }

    //create a new User
    const newUser = new User({
      name,
      email,
      password,
      username,
    });

    //generate the verification token
    newUser.verificationToken = crypto.randomBytes(20).toString("hex");

    //save the user to the database
    await newUser.save();

    //send the verification email to the registered user

    res.status(202).json({
      message:
        "Registration successful.Please check your mail for verification",
    });
  } catch (error) {
    console.log("Error registering user", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

//endpoint to verify email

const generateSecretKey = () => {
  const secretKey = crypto.randomBytes(32).toString("hex");

  return secretKey;
};

const secretKey = generateSecretKey();

//endpoint to login a user.
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    //check if user exists already
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    //check if password is correct
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id }, secretKey);

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});
//users profile
app.get("/profile/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving user profile" });
  }
});
app.get("/users/:userId", async (req, res) => {
  try {
    const loggedInUserId = req.params.userId;

    //fetch the logged-in user's connections
    const loggedInuser = await User.findById(loggedInUserId).populate(
      "following",
      "_id"
    );
    if (!loggedInuser) {
      return res.status(400).json({ message: "User not found" });
    }

    //get the ID's of the connected users
    const connectedUserIds = loggedInuser.following.map(
      (following) => following._id
    );

    //find the users who are not connected to the logged-in user Id
    const users = await User.find({
      _id: { $ne: loggedInUserId, $nin: connectedUserIds },
    });

    res.status(200).json(users);
  } catch (error) {
    console.log("Error retrieving users", error);
    res.status(500).json({ message: "Error retrieving users" });
  }
});

//send connection request
app.post("/follow", async (req, res) => {
  try {
    const { currentUserId, selectedUserId } = req.body;

    await User.findByIdAndUpdate(selectedUserId, {
      $push: { followers: currentUserId },
    });

    await User.findByIdAndUpdate(currentUserId, {
      $push: { following: selectedUserId },
    });

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ message: "Error creating connection request" });
  }
});

app.get("/follow/:userId", async (req, res) => {
  try {
    const { userId } = req.params.userId;

    const user = await User.findById(userId)
      .populate("following", "name email profileImage")
      .exec();
    console.log(user);
    const followers = user.followers;

    res.json(followers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//add bookmark
app.post("/bookmark/:postId", async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.body.userId;
    const post = req.body.post;
    console.log(post);
    // Find the user by ID and update the bookmarks array
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const index = user.bookmarks.findIndex(
      (bookmark) => bookmark.id === postId
    );
    if (index === -1) {
      // If post is not already bookmarked, add it
      user.bookmarks.push(post);
    } else {
      // If post is already bookmarked, remove it
      user.bookmarks.splice(index, 1);
    }

    await user.save();

    res.status(200).json({
      message: "Bookmark updated successfully",
      bookmarks: user.bookmarks,
    });
  } catch (error) {
    console.log("Error updating bookmark", error);
    res.status(500).json({ message: "Error updating bookmark" });
  }
});

//creating post
app.post("/create", async (req, res) => {
  try {
    const { description, imageUrl, userId } = req.body;

    const newPost = new Tweet({
      description: description,
      imageUrl: imageUrl,
      userId: userId,
    });

    await newPost.save();

    res
      .status(201)
      .json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    console.log("error creating the post", error);
    res.status(500).json({ message: "Error creating the post" });
  }
});

//to fetch all post
app.get("/all", async (req, res) => {
  try {
    const posts = await Tweet.find().populate(
      "userId",
      "name username profileImage"
    );

    res.status(200).json({ posts });
  } catch (error) {
    console.log("error fetching all the posts", error);
    res.status(500).json({ message: "Error fetching all the posts" });
  }
});

//to like
// Route to like or dislike a tweet
app.post("/tweet/:tweetId/likeOrDislike", async (req, res) => {
  try {
    const { tweetId } = req.params;

    const { userId } = req.body;

    // Find the tweet by its ID
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
      return res.status(404).json({ message: "Tweet not found" });
    }

    // Check if the user has already liked the tweet
    const alreadyLikedIndex = tweet.like.indexOf(userId);

    if (alreadyLikedIndex !== -1) {
      // If the user has already liked the tweet, dislike it
      tweet.like.splice(alreadyLikedIndex, 1);
      await tweet.save();
      return res.status(200).json({ message: "User disliked the tweet" });
    } else {
      // If the user has not liked the tweet, like it
      tweet.like.push(userId);
      await tweet.save();
      return res.status(200).json({ message: "User liked the tweet" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//to add bio
app.put("/profile/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { userDescription } = req.body;
    console.log("okkr", req.params);
    await User.findByIdAndUpdate(userId, { userDescription });

    res.status(200).json({ message: "User profile updated successfully" });
  } catch (error) {
    console.log("Error updating user Profile", error);
    res.status(500).json({ message: "Error updating user profile" });
  }
});

// set profile image
app.post("/setprofile", async (req, res) => {
  try {
    const { profileImage, userId } = req.body;
    await User.findByIdAndUpdate(userId, {
      $set: { profileImage: profileImage },
    });
    res.status(200).json({ message: "Post created successfully" });
  } catch (error) {
    console.log("error creating the post", error);
    res.status(500).json({ message: "Error creating the post" });
  }
});

//comment
app.post("/tweet/:id/comment", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const { comments } = req.body;
    console.log("yoyo", comments);
    await Tweet.findByIdAndUpdate(id, {
      $push: { comments: comments },
    });

    res.status(200).json({ message: "Post created successfully" });
  } catch (error) {
    console.log("error creating the comment", error);
    res.status(500).json({ message: "Error creating the post" });
  }
});

//delete post
app.delete("/delete/:postId", async (req, res) => {
  try {
    const postId = req.params.postId;

    // Find the post by its ID and delete it
    await Tweet.findByIdAndDelete(postId);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error deleting the post", error);
    res.status(500).json({ message: "Error deleting the post" });
  }
});

//
app.get("/checkBookmark/:userId/:postId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const postId = req.params.postId;

    // Find the user by ID and check if the post is bookmarked
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the post is bookmarked by searching for its postId in the bookmarks array
    const isBookmarked = user.bookmarks.some(
      (bookmark) => bookmark.postId === postId
    );

    res.status(200).json({ isBookmarked });
  } catch (error) {
    console.log("Error checking bookmark status:", error);
    res.status(500).json({ message: "Error checking bookmark status" });
  }
});

const mongoose = require("mongoose");

const tweetSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    imageUrl: String,
    like: {
      type: Array,
      default: [],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    comments: [
      {
        name: String,

        text: String,
      },
    ],
    userDetails: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);
const Tweet = mongoose.model("Tweet", tweetSchema);
module.exports = Tweet;

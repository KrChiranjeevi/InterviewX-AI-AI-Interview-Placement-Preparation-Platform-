const Community = require('../models/Community');
const Report = require('../models/Report');
const User = require('../models/User');

const getPosts = async (req, res) => {
  try {
    const posts = await Community.find()
      .populate('user', 'name profileImage badges')
      .populate('comments.user', 'name profileImage')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts' });
  }
};

const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const newPost = await Community.create({
      user: req.user._id,
      title,
      content
    });
    
    // Populate user details before returning
    const populatedPost = await Community.findById(newPost._id).populate('user', 'name profileImage badges');
    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Error creating post' });
  }
};

const replyToPost = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Community.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    post.comments.push({
      user: req.user._id,
      content
    });
    
    await post.save();
    const updatedPost = await Community.findById(post._id)
      .populate('user', 'name profileImage badges')
      .populate('comments.user', 'name profileImage');
      
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Error replying to post' });
  }
};

const likePost = async (req, res) => {
  try {
    const post = await Community.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const isLiked = post.likes.includes(req.user._id);
    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
    }
    
    await post.save();
    res.json({ likes: post.likes });
  } catch (error) {
    res.status(500).json({ message: 'Error liking post' });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    // Calculate leaderboard based on Reports
    const leaderboardData = await Report.aggregate([
      {
        $group: {
          _id: "$user",
          averageScore: { $avg: "$overallScore" },
          interviewsCompleted: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          _id: 1,
          name: "$userDetails.name",
          profileImage: "$userDetails.profileImage",
          badges: "$userDetails.badges",
          averageScore: { $round: ["$averageScore", 1] },
          interviewsCompleted: 1
        }
      },
      {
        $sort: { averageScore: -1, interviewsCompleted: -1 }
      },
      { $limit: 20 } // top 20
    ]);
    
    // Map to include rank
    const rankedLeaderboard = leaderboardData.map((user, index) => ({
      ...user,
      rank: index + 1
    }));
    
    res.json(rankedLeaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
};

module.exports = { getPosts, createPost, replyToPost, likePost, getLeaderboard };

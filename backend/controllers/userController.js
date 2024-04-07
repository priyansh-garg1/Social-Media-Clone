import mongoose from "mongoose";
import generateTokenAndSetCookie from "../helpers/generateTokenAndSetCookie.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import Post from "../models/postModel.js";

const getUserProfile = async (req, res) => {
  // query either username or userId
  const { query } = req.params;
  try {
    let user;
    if (mongoose.Types.ObjectId.isValid(query)) {
      user = await User.findOne({ _id: query })
        .select("-password")
        .select("-updatedAt");
    } else {
      user = await User.findOne({ username: query })
        .select("-password")
        .select("-updatedAt");
    }
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in getting user profile");
    return res.status(500).json({ error: error.message });
  }
};

const getSuggestedUsers = async (req,res) => {
  try {
    const userId = req.user._id;
    const userFollowedByYou = await User.findById(userId).select("following");
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne:userId },
        },
      },
      {
        $sample:{size:10}  
      },
    ])
    const filteredUser = users.filter(user => !userFollowedByYou.following.includes(user._id))
    const suggestedUser = filteredUser.slice(0,4);
    suggestedUser.forEach(user => user.passwords = null)
    return res.status(200).json(suggestedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const signupUser = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    console.log({ name, password, email, username });
    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      res.status(400).json({ error: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });
    await newUser.save();
    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        bio: newUser.bio,
        profilePic: newUser.profilePic,
        message: "User created successfully",
      });
    } else {
      res.status(201).json({ error: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in signup user");
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );
    if (!user || !isPasswordCorrect) {
      res.status(400).json({ error: "Invalid username or password" });
    }

    generateTokenAndSetCookie(user._id, res);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      bio: user.bio,
      profilePic: user.profilePic,
      message: "User loggedin successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in login user");
  }
};

const logoutUser = async (req, res) => {
  try {
    res
      .cookie("jwt", "", { maxAge: 1 })
      .status(201)
      .json({ message: "User loggedout successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in logout user");
  }
};

const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const useraToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: "You cannot follow/unfollow yourself" });
    }

    if (!useraToModify || !currentUser)
      return res.status(400).json({ error: "User not found" });
    const isFollowing = currentUser.following.includes(id);
    if (isFollowing) {
      await User.findByIdAndUpdate(req.user.id, { $pull: { following: id } });
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      return res.status(201).json({ message: "User unfollowed successfully" });
    } else {
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      return res.status(201).json({ message: "User followed successfully" });
    }
  } catch (error) {
    console.log("Error in foloow/unfollow user");
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  const { name, email, username, password, bio } = req.body;
  let { profilePic } = req.body;
  const userId = req.user._id;
  try {
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (req.params.id !== userId.toString()) {
      return res
        .status(404)
        .json({ error: "You cannot update profile of other user" });
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }

    if (profilePic) {
      if (user.profilePic) {
        await cloudinary.uploader.destroy(
          user.profilePic.split("/").pop().split(".")[0]
        );
      }
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      profilePic = uploadResponse.secure_url;
    }
    user.name = name || user.name;
    user.username = username || user.username;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.profilePic = profilePic || user.profilePic;

    user = await user.save();

    await Post.updateMany(
      { "replies.userId": userId },
      {
        $set: {
          "replies.$[reply].username": user.username,
          "replies.$[reply].userProfilePic": user.profilePic,
        },
      },
      { arrayFilters: [{ "reply.userId": userId }] }
    );

    user.password = null;

    return res.status(201).json(user);
  } catch (error) {
    console.log("Error in updateUser");
    return res.status(500).json({ error: error.message });
  }
};

export {
  signupUser,
  loginUser,
  logoutUser,
  followUnfollowUser,
  updateUser,
  getUserProfile,
  getSuggestedUsers
};

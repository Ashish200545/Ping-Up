
import imageKit from "../configs/imageKit.js";
import { inngest } from "../inngest/index.js";
import Connection from "../models/Connections.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import fs from "fs";
import { clerkClient } from "@clerk/express";

// Get User Data using Clerk userId
export const getUserData = async (req, res) => {
    try {
        const { userId } = await req.auth();

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User is not authenticated"
            });
        }

        const clerkUser = await clerkClient.users.getUser(userId);

        const email =
            clerkUser.emailAddresses.find(
                item => item.id === clerkUser.primaryEmailAddressId
            )?.emailAddress ||
            clerkUser.emailAddresses[0]?.emailAddress;

        const full_name =
            [clerkUser.firstName, clerkUser.lastName]
                .filter(Boolean)
                .join(" ") ||
            clerkUser.username ||
            "";

        if (!email || !full_name) {
            return res.status(400).json({
                success: false,
                message:
                    "A valid email and full name are required in your Clerk profile."
            });
        }

        let user = await User.findById(userId);

        if (!user) {
            user = await User.create({
                _id: userId,
                username:
                    clerkUser.username || `user_${userId.slice(-8)}`,
                email,
                full_name,
                bio: "",
                location: "",
                profile_picture: clerkUser.imageUrl || "",
                cover_photo: "",
                followers: [],
                following: [],
                connections: []
            });
        } else {
            const updates = {};

            if (!user.email) updates.email = email;
            if (!user.full_name) updates.full_name = full_name;

            if (Object.keys(updates).length > 0) {
                user = await User.findByIdAndUpdate(
                    userId,
                    { $set: updates },
                    { new: true, runValidators: true }
                );
            }
        }

        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error("getUserData error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch user data"
        });
    }
};

// Update User Data
export const updateUserData = async (req, res) => {
    try {
        const { userId } = await req.auth();

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User is not authenticated"
            });
        }

        const tempUser = await User.findById(userId);

        if (!tempUser) {
            return res.status(404).json({
                success: false,
                message: "User profile not found"
            });
        }

        let { username, bio, location, full_name } = req.body;

        username = username || tempUser.username;

        if (tempUser.username !== username) {
            const existingUser = await User.findOne({ username });

            if (existingUser) {
                username = tempUser.username;
            }
        }

        const updatedData = {
            username,
            bio: bio ?? tempUser.bio,
            location: location ?? tempUser.location,
            full_name: full_name || tempUser.full_name
        };

        const profile = req.files?.profile?.[0];
        const cover = req.files?.cover?.[0];

        if (profile) {
            const buffer = fs.readFileSync(profile.path);

            const response = await imageKit.upload({
                file: buffer,
                fileName: profile.originalname
            });

            updatedData.profile_picture = imageKit.url({
                path: response.filePath,
                transformation: [
                    { quality: "auto" },
                    { format: "webp" },
                    { width: "512" }
                ]
            });
        }

        if (cover) {
            const buffer = fs.readFileSync(cover.path);

            const response = await imageKit.upload({
                file: buffer,
                fileName: cover.originalname
            });

            updatedData.cover_photo = imageKit.url({
                path: response.filePath,
                transformation: [
                    { quality: "auto" },
                    { format: "webp" },
                    { width: "1280" }
                ]
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updatedData },
            { new: true, runValidators: true }
        );

        return res.json({
            success: true,
            user,
            message: "Profile updated successfully"
        });
    } catch (error) {
        console.error("updateUserData error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Find Users using username, email, location, or name
export const dicoverUsers = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { input } = req.body;

        if (!input) {
            return res.json({
                success: false,
                message: "Search input is required"
            });
        }

        const escapedInput = input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const allUsers = await User.find({
            $or: [
                { username: new RegExp(escapedInput, "i") },
                { email: new RegExp(escapedInput, "i") },
                { full_name: new RegExp(escapedInput, "i") },
                { location: new RegExp(escapedInput, "i") }
            ]
        });

        const filteredUsers = allUsers.filter(
            user => user._id.toString() !== userId.toString()
        );

        return res.json({
            success: true,
            users: filteredUsers
        });
    } catch (error) {
        console.error("dicoverUsers error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Follow User
export const followUser = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { id } = req.body;

        if (!userId || !id) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        if (userId === id) {
            return res.status(400).json({
                success: false,
                message: "You cannot follow yourself"
            });
        }

        const user = await User.findById(userId);
        const targetUser = await User.findById(id);

        if (!user || !targetUser) {
            return res.status(404).json({
                success: false,
                message: "User profile not found"
            });
        }

        if (user.following.some(item => item.toString() === id)) {
            return res.json({
                success: false,
                message: "You are already following this user"
            });
        }

        user.following.push(id);
        targetUser.followers.push(userId);

        await Promise.all([user.save(), targetUser.save()]);

        return res.json({
            success: true,
            message: "Now you are following this user"
        });
    } catch (error) {
        console.error("followUser error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Unfollow User
export const unfollowUser = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { id } = req.body;

        const user = await User.findById(userId);
        const targetUser = await User.findById(id);

        if (!user || !targetUser) {
            return res.status(404).json({
                success: false,
                message: "User profile not found"
            });
        }

        user.following = user.following.filter(
            item => item.toString() !== id
        );

        targetUser.followers = targetUser.followers.filter(
            item => item.toString() !== userId
        );

        await Promise.all([user.save(), targetUser.save()]);

        return res.json({
            success: true,
            message: "You are no longer following this user"
        });
    } catch (error) {
        console.error("unfollowUser error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Send Connection Request
export const sendConnectionRequest = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { id } = req.body;

        if (!userId || !id) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        if (userId === id) {
            return res.status(400).json({
                success: false,
                message: "You cannot connect with yourself"
            });
        }

        const last24Hours = new Date(
            Date.now() - 24 * 60 * 60 * 1000
        );

        const recentRequests = await Connection.countDocuments({
            from_user_id: userId,
            created_at: { $gt: last24Hours }
        });

        if (recentRequests >= 20) {
            return res.json({
                success: false,
                message:
                    "You have sent more than 20 connection requests in the last 24 hours"
            });
        }

        const targetUser = await User.findById(id);

        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: "Target user profile not found"
            });
        }

        const connection = await Connection.findOne({
            $or: [
                { from_user_id: userId, to_user_id: id },
                { from_user_id: id, to_user_id: userId }
            ]
        });

        if (connection) {
            if (connection.status === "accepted") {
                return res.json({
                    success: false,
                    message: "You are already connected with this user"
                });
            }

            return res.json({
                success: false,
                message: "Connection request pending"
            });
        }

        const newConnection = await Connection.create({
            from_user_id: userId,
            to_user_id: id
        });

        await inngest.send({
            name: "app/connection-request",
            data: { connectionId: newConnection._id.toString() }
        });

        return res.json({
            success: true,
            message: "Connection request sent successfully"
        });
    } catch (error) {
        console.error("sendConnectionRequest error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get User Connections
export const getUserConnections = async (req, res) => {
    try {
        const { userId } = await req.auth();

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User is not authenticated"
            });
        }

        const user = await User.findById(userId)
            .populate("connections followers following");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User profile not found. Fetch user data first."
            });
        }

        const pendingResults = await Connection.find({
            to_user_id: userId,
            status: "pending"
        }).populate("from_user_id");

        return res.status(200).json({
            success: true,
            connections: user.connections || [],
            followers: user.followers || [],
            following: user.following || [],
            pendingConnections: pendingResults
                .map(connection => connection.from_user_id)
                .filter(Boolean)
        });
    } catch (error) {
        console.error("getUserConnections error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch user connections"
        });
    }
};

// Accept Connection Request
export const acceptConnectionRequest = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { id } = req.body;

        if (!userId || !id) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        const connection = await Connection.findOne({
            from_user_id: id,
            to_user_id: userId
        });

        if (!connection) {
            return res.status(404).json({
                success: false,
                message: "Connection request not found"
            });
        }

        if (connection.status === "accepted") {
            return res.json({
                success: false,
                message: "Connection already accepted"
            });
        }

        const user = await User.findById(userId);
        const sender = await User.findById(id);

        if (!user || !sender) {
            return res.status(404).json({
                success: false,
                message: "User profile not found"
            });
        }

        if (!user.connections.some(item => item.toString() === id)) {
            user.connections.push(id);
        }

        if (!sender.connections.some(item => item.toString() === userId)) {
            sender.connections.push(userId);
        }

        connection.status = "accepted";

        await Promise.all([
            user.save(),
            sender.save(),
            connection.save()
        ]);

        return res.json({
            success: true,
            message: "Connection accepted successfully"
        });
    } catch (error) {
        console.error("acceptConnectionRequest error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to accept connection request"
        });
    }
};

// Get User Profiles
export const getUserProfiles = async (req, res) => {
    try {
        const { profileId } = req.body;

        if (!profileId) {
            return res.status(400).json({
                success: false,
                message: "Profile ID is required"
            });
        }

        const profile = await User.findById(profileId);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }

        const posts = await Post.find({
            user: profileId
        }).populate("user");

        return res.json({
            success: true,
            profile,
            posts
        });
    } catch (error) {
        console.error("getUserProfiles error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const Post = require("../models/postModel");

function validatePostBody(body) {
  if (!body || !body.title || !body.description || !body.tags) {
    return {
      valid: false,
      msg: "Title, Description, and Tags are required fields.",
    };
  }
  if (typeof body.title !== "string" || typeof body.description !== "string") {
    return {
      valid: false,
      msg: "Title and Description must be strings.",
    };
  }

  return { valid: true };
}

async function handleGetAllPosts(req, res) {
  try {
    const allDbPosts = await Post.find({});
    return res.status(200).json(allDbPosts);
  } catch (error) {
    console.error("Error fetching all posts:", error.message);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to fetch posts." });
  }
}

async function handleGetPostById(req, res) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res
        .status(404)
        .json({ status: "error", message: "Post not found." });
    }
    return res.status(200).json(post);
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid post ID format." });
    }
    console.error("Error fetching post by ID:", error.message);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to fetch post." });
  }
}

async function handleCreateNewPost(req, res) {
  try {
    const body = req.body;

    const validation = validatePostBody(body);
    if (!validation.valid) {
      return res.status(400).json({ status: "error", message: validation.msg });
    }

    const result = await Post.create({
      ...body,
      user: req.user._id,
    });

    return res.status(201).json({
      status: "success",
      id: result._id,
      message: "New Post created successfully.",
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ status: "error", message: error.message });
    }
    console.error("Error creating new post:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error: Failed to create new post.",
    });
  }
}

async function handleUpdatePostById(req, res) {
  try {
    const body = req.body;
    if (Object.keys(body).length === 0) {
      return res
        .status(400)
        .json({ status: "error", message: "No fields provided for update." });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res
        .status(404)
        .json({ status: "error", message: "Post not found for update." });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "Forbidden: You can only modify your own posts.",
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: body },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      status: "success",
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid post ID format." });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ status: "error", message: error.message });
    }
    console.error("Error updating post:", error.message);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to update post." });
  }
}

async function handleDeletePostById(req, res) {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ status: "error", message: "Post not found for deletion." });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "Forbidden: You can only delete your own posts.",
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      status: "success",
      deleted_id: req.params.id,
      message: "Post deleted successfully.",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid post ID format." });
    }
    console.error("Error deleting post:", error.message);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to delete post." });
  }
}

module.exports = {
  handleGetAllPosts,
  handleGetPostById,
  handleCreateNewPost,
  handleUpdatePostById,
  handleDeletePostById,
};

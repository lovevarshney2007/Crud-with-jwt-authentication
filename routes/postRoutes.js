const express = require("express");
const Controller = require("../controllers/postController");

const { restrictToLoggedInUser } = require("../middlewares/auth");

const router = express.Router();

router
  .route("/")

  .get(Controller.handleGetAllPosts)

  .post(restrictToLoggedInUser, Controller.handleCreateNewPost);

router
  .route("/:id")

  .get(Controller.handleGetPostById)

  .put(restrictToLoggedInUser, Controller.handleUpdatePostById)

  .delete(restrictToLoggedInUser, Controller.handleDeletePostById);

module.exports = router;

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const { connectMongoDb } = require("./config/db");

const postRouter = require("./routes/postRoutes");
const authRouter = require("./routes/authRoutes");

const app = express();

const PORT = process.env.PORT || 8000;

connectMongoDb(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection failed:", err.message));

app.use(morgan("combined"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  req.userName = "lovevarsheny.dev";
  next();
});

app.use("/api/auth", authRouter);

app.use("/api/posts", postRouter);

app.listen(PORT, () => console.log("Server started at Port :", PORT));

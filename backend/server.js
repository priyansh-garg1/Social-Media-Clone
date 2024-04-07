import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoute.js";
import postRoutes from "./routes/postRoutes.js";
import messagesRoutes from "./routes/messagesRoutes.js";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import {app,server} from './socket/socket.js'

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(express.json({limit:"5mb"}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true
}

app.use(cors(corsOptions));

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messagesRoutes);


server.listen(PORT, () =>
  console.log(`Server started at http://localhost:${PORT}`)
);

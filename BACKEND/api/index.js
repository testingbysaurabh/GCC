// Vercel Serverless Function Entry Point
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { OtpRouter } = require("../src/routes/OtpRoutes");
const { AuthRoutes } = require("../src/routes/AuthRoutes");
const { PostRoutes } = require("../src/routes/PostRoutes");

const app = express();

// CORS configuration for Vercel
const allowedOrigins = process.env.ORIGIN 
    ? process.env.ORIGIN.split(',').map(origin => origin.trim())
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Check if origin is in allowed list
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            // For Vercel preview deployments, allow any vercel.app domain
            if (origin.includes('.vercel.app') || origin.includes('localhost')) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api", OtpRouter);
app.use("/api", AuthRoutes);
app.use("/api", PostRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "OK", message: "Server is running" });
});

// Database connection
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("GCC db Connect");
    })
    .catch((err) => {
        console.log("DB Connection fail:", err.message);
    });

// Export for Vercel serverless functions
module.exports = app;


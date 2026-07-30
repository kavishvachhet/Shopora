const express = require('express');
const app = express();

const cookieParser = require('cookie-parser');
const path = require('path');
const db = require('./config/mongoose_connection');

const ownerrouter = require("./routes/ownerrouter");
const userrouter = require("./routes/userrouter");
const productrouter = require("./routes/productrouter");
const indexrouter = require("./routes/index");
const apirouter = require("./routes/api");

const expressSession = require("express-session");
const flash = require("connect-flash");

require("dotenv").config();

// View engine setup - should be early
app.set("view engine", "ejs");

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files - should come before routes
app.use(express.static(path.join(__dirname, "public")));

// Session middleware
app.use(
    expressSession({
        resave: false,
        saveUninitialized: false,
        secret: process.env.SESSION_SECRET, 
    })
);

// Flash middleware
app.use(flash());

// IMPORTANT: Make flash messages available to all views
app.use((req, res, next) => {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.loggedin = req.cookies.token ? true : false;
    next();
});

// CORS for React dev server
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && origin.includes('localhost:5173')) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// Routes
app.use("/api", apirouter);
app.use("/", indexrouter);
app.use("/owner", ownerrouter);
app.use("/users", userrouter);
app.use("/products", productrouter);

module.exports = app;
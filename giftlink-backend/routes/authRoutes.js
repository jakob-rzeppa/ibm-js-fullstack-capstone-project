//Step 1 - Task 2: Import necessary packages
const express = require("express");
const app = express();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const connectToDatabase = require("../models/db");
const router = express.Router();
const dotenv = require("dotenv");
const pino = require("pino"); // Import Pino logger

//Step 1 - Task 3: Create a Pino logger instance
const logger = pino();

dotenv.config();

//Step 1 - Task 4: Create JWT secret
const JWT_SECRET = process.env.JWT_SECRET;

router.post("/register", async (req, res) => {
  try {
    // Task 1: Connect to `giftsdb` in MongoDB through `connectToDatabase` in `db.js`
    const db = await connectToDatabase();

    // Task 2: Access MongoDB collection
    const collection = db.collection("users");

    //Task 3: Check for existing email
    const existingEmail = await collection.findOne({ email: req.body.email });
    if (existingEmail)
      return res
        .status(404)
        .json({ message: "User with this email already exists!" });

    const salt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(req.body.password, salt);
    const email = req.body.email;
    //Task 4: Save user details in database
    const newUser = await collection.insertOne({
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: hash,
      createdAt: new Date(),
    });

    //Task 5: Create JWT authentication with user._id as payload
    const payload = {
      user: {
        id: newUser.insertedId,
      },
    };

    const authtoken = jwt.sign(payload, JWT_SECRET);

    logger.info("User registered successfully");
    res.json({ authtoken, email });
  } catch (e) {
    return res.status(500).send("Internal server error");
  }
});

router.post("/login", async (req, res) => {
  try {
    // Task 1: Connect to `giftsdb` in MongoDB through `connectToDatabase` in `db.js`.
    const db = await connectToDatabase();

    // Task 2: Access MongoDB `users` collection
    const collection = db.collection("users");

    // Task 3: Check for user credentials in database
    const theUser = await collection.findOne({ email: req.body.email });

    // Task 7: Send appropriate message if user not found
    if (!theUser) {
      console.err("User not found");
      return res.status(404).json({ error: "User not found" });
    }

    // Task 4: Task 4: Check if the password matches the encrypyted password and send appropriate message on mismatch
    let result = await bcryptjs.compare(req.body.password, theUser.password);
    if (!result) {
      console.err("Passwords do not match");
      return res.status(404).json({ error: "Wrong pasword" });
    }

    // Task 5: Fetch user details from database
    const userName = theUser.firstName;
    const userEmail = theUser.email;

    // Task 6: Create JWT authentication if passwords match with user._id as payload
    const payload = {
      user: {
        id: theUser.id,
      },
    };

    const authtoken = await jwt.sign(payload, JWT_SECRET);

    res.json({ authtoken, userName, userEmail });
  } catch (e) {
    return res.status(500).send("Internal server error");
  }
});

router.put("/update", async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error("Validation errors in update request", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const email = req.headers.email;
  if (!email) {
    logger.error("Email not found in the request headers");
    return res
      .status(400)
      .json({ error: "Email not found in the request headers" });
  }
  try {
    const db = await connectToDatabase();

    const collection = db.collection("users");

    const existingUser = await collection.findOne({ email });
    existingUser.updatedAt = new Date();

    const updatedUser = await collection.findOneAndUpdate(
      { email },
      { $set: existingUser },
      { returnDocument: "after" }
    );

    const payload = {
      user: {
        id: updatedUser._id.toString(),
      },
    };

    const authtoken = jwt.sign(payload, JWT_SECRET);
    res.json({ authtoken });
  } catch (e) {
    return res.status(500).send("Internal server error");
  }
});

module.exports = router;

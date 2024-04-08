/*const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const collection = require("./mongodb");

const templatePath = path.join(__dirname, '../templates');
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../imagee')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "hbs");
app.set("views", templatePath);

// MongoDB connection
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/Loginpage", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB", err);
    });

// Define a mongoose schema for user data
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true, // Ensure email is unique
        validate: {
            validator: function(v) {
                // Regex for email validation
                return /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    password: {
        type: String,
        required: true
    }
});

// Create a mongoose model based on the schema
const User = mongoose.model("User", userSchema);

// Route for handling form submission
app.post("/login", async (req, res) => {
    const userData = {
        email: req.body.email,
        password: req.body.password
    };
    try {
        // Create a new user instance
        const newUser = new User(userData);
        // Save the user to the database
        await newUser.save();
        res.render("home");
    } catch (error) {
        // If there's an error, render the login page again with the error message
        res.render("login", { error: error.message });
    }
})*/
const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/LoginFormPractice');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const logInSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type:String,
        required:true
    }
})
const LogInCollection=new mongoose.model('LogInCollection',logInSchema)

module.exports=LogInCollection 

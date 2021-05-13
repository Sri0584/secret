//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt = require("mongoose-encryption");

const app = express();


app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB",{ useNewUrlParser: true, useUnifiedTopology: true})
//because of encryption
const userSchema = new mongoose.Schema({
    email: String,
    password: String
}) ;
//secret declared in env file.
userSchema.plugin(encrypt,{ secret:process.env.SECRET, encryptedFields: ["password"] });

const secretsSchema = {
    content: String
}

const Secret = new mongoose.model("Secret", secretsSchema);
const User = new mongoose.model("User", userSchema);

app.get("/", (req,res) => {
    res.render("home");
});

app.get("/login", (req,res) => {
    res.render("login");
});

app.get("/register", (req,res) => {
    res.render("register");
});

app.get("/submit", (req,res) => {
    res.render("submit");
});

app.get("/secrets", (req,res) => {
    User.find({}, (err, secrets) => {
        if(!err && !secrets.length === 0){
            res.render("secrets");
        }else{
            console.log(err);
        }
    });
 
});
app.post("/register", (req,res)=> {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save(function(err){
        if (!err){
          res.render("secrets");
        }else{
            console.log(err);
        }
      });
});

app.post("/submit", (req,res) => {
    const newSecret = new Secret({
        content: req.body.secret
    });

    newSecret.save(err => {
        if(!err){
            res.render("secrets");
        }else{
            console.log(err);
        }
    });
});

app.post("/login", (req,res)=> {
    User.findOne({email: req.body.username}, function(err, foundUser){
        if(!err){
            if(foundUser){
                if(foundUser.password === req.body.password){
                    res.render("secrets");
                }
            }
        }
        else{
            console.log("User not Found!!");
        }
       
    });
});
app.listen(3000, function() {
  console.log("Server started on port 3000");
});

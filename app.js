//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
// const encrypt = require("mongoose-encryption");
// const md5 = require("md5");
const bcrypt = require("bcrypt");
const saltRounds = 10;

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
// userSchema.plugin(encrypt,{ secret:process.env.SECRET, encryptedFields: ["password"] });

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
    
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        const newUser = new User({
            email: req.body.username,
            // password: md5(req.body.password)
            password: hash
        });
        newUser.save(function(err){
            if (!err){
              res.render("secrets");
            }else{
                console.log(err);
            }
          });
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
                // if(foundUser.password === md5(req.body.password)){
                    bcrypt.compare(req.body.password,foundUser.password,  function(err, result) {
                        // result == true
                        res.render("secrets");
                    });
                   
                
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

//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
//encrypting password with salting and hashing..

const session = require("express-session");
const passport = require("passport");
const plm = require("passport-local-mongoose");


const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
    secret: 'Our little secret',
    resave: false,
    saveUninitialized: false
  }));

  app.use(passport.initialize());
  app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB",{ useNewUrlParser: true, useUnifiedTopology: true})
mongoose.set('useCreateIndex', true);

//because of encryption
const userSchema = new mongoose.Schema({
    email: String,
    password: String
}) ;

userSchema.plugin(plm);

const secretsSchema = {
    name: String,
    content: String
}

const User = new mongoose.model("User", userSchema);
const Secret = new mongoose.model("Secret", secretsSchema);

passport.use(User.createStrategy());
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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
      /*
  Course code was allowing the user to go back to the secrets page after loggin out,
  that is because when we access a page, it is cached by the browser, so when the user is accessing a cached page (like the secrets one)
  you can go back by pressing the back button on the browser, the code to fix it is the one below so the page will not be cached
  */
    // res.set(
    //     'Cache-Control', 
    //     'no-cache, private, no-store, must-revalidate, max-stal e=0, post-check=0, pre-check=0'
    // );
    if(req.isAuthenticated()) {
        res.render("secrets");        
    } else {
        res.redirect("/login");
    }
});

app.get("/logout", function(req,res) {
    req.logout();
    res.redirect("/");
});

app.post("/register", (req,res)=> {
    //plm package
    User.register({username: req.body.username}, req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req,res, function(){
                res.redirect("/secrets");
            });
        }
    });
});



app.post("/login", passport.authenticate("local"), function(req, res) {
 
    //Now we will incorporate hashing and salting and authentication using passport.js and the packages just added (passport passport-local passport-local-mongoose express-session)
   
    //Create a new user from the mongoose model with its two properties (username, password)
    const user = new User({
      username: req.body.username,
      password: req.body.password
    });
   
    //Now use passport to login the user and authenticate him - take the user created from above
    req.login(user, function(err) {
      if (err) {
        console.log(err);
      } else {
        //Authenticate the user if there are no errors
        passport.authenticate("local")(req, res, function() {
          res.redirect("/secrets");
        });
      }
    });
  });

// app.post("/submit", (req,res) => {
//     const newSecret = new Secret({
//         content: req.body.secret
//     });

//     newSecret.save(err => {
//         if(!err){
//             res.redirect("/secrets");
//         }else{
//             console.log(err);
//         }
//     });
// });


app.listen(3000, function() {
    console.log("Server started on port 3000!!!");
  });

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const passport = require("passport");
const {ensureAuthenticated}=require("../config/auth")

// Login page
router.get("/login", (req, res) => res.render("login"));

// forgot password
router.get("/forgotpassword", (req, res) => {
  res.render("forgotpassword");
});

// forgot password
router.post("/forgotpassword", (req, res) => {
  const { email, Secret } = req.body;
    let errors=[]
  User.findOne({ email }).then((user) => {
    if (!user) {
      errors.push({ msg: "Email not found" });
      res.render("forgotpassword", { errors });
    } else if (user && user.secret !== Secret) {
      errors.push({ msg: "Secret is incorrect" });
      res.render("forgotpassword", { errors });
    } else {
      errors.push({ msg: `${user.password} is your password.` });
      res.render("forgotpassword", { errors });
    }
  });
});

// Register Page
router.get("/register", (req, res) => res.render("register"));

// Register Handle
router.post("/register", (req, res) => {
  const { email, password, secret } = req.body;

  // form-validation
  let errors = [];

  // check all required fields
  if (!email || !password || !secret) {
    errors.push({ msg: "Please fill in all the fields" });
  }

  // password length < 6
  if (password.length < 6) {
    errors.push({ msg: "password should be atleast 6 chars long" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      email,
      password,
      secret,
    });
  } else {
    // validation passed

    // checking if email is already registered
    User.findOne({ email: email }).then((user) => {
      if (user) {
        // user exists
        errors.push({ msg: "Email is already registered" });
        res.render("register", {
          errors,
          email,
          password,
          secret,
        });
      } else {
        const newUser = new User({
          email,
          password,
          secret,
        });
        newUser
          .save()
          .then(() => {
            req.flash("success_msg", "You are now registerd and can login");
            res.redirect("/users/login");
          })
          .catch((err) => console.log(err));
      }
    });
  }
});

// Login handle
router.post("/login",  passport.authenticate("local", {
    failureRedirect: "/users/login",
    failureFlash: true,
  }),(req,res)=>{
    res.redirect(`dashboard`)
  }
);

// Logout Handle
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});
 
// comments page
router.get("/dashboard", ensureAuthenticated,(req,res)=>{
  User.find().then(users=>{
    let userarray=[]
    users.forEach(user=>{
      userarray.push({
        email:user.email,
        comments:user.comments,
      })
    })
    res.render('dashboard',{
      userarray,
    })
  })
  
})

// save and display comments
router.post('/dashboard', ensureAuthenticated,(req,res)=>{
  const {usercomment} = req.body
  User.findOne({email:req.user.email})
    .then(user=>{
      user.comments.push(usercomment)
      user.save()
      // console.log(user.comments)
    })
  res.redirect("dashboard")
})

// filter comments
router.get("/dashboard/me", ensureAuthenticated,(req,res)=>{
  User.find({email:req.user.email}).then(users=>{
    let userarray=[]
    users.forEach(user=>{
      userarray.push({
        email:user.email,
        comments:user.comments,
      })
    })
    res.render('dashboard',{
      userarray,
    })
  })
  
})
module.exports = router;
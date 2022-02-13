const express = require("express");
const mongoose = require("mongoose");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");

const app = express();

// passport configuration
require('./config/passport')(passport)

// db configuration and connecting to mongodb
const db = require("./config/keys").MongoURI;
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB connected...."))
  .catch((err) => console.log(err));

//static files
app.use(express.static("public"));
// app.use('/css', express.static(__dirname + 'public/css'))

// EJS
app.use(expressLayouts);
app.set("view engine", "ejs");
// Bodyparser
app.use(express.urlencoded({ extended: false }));

// express session middleware
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// connect flash
app.use(flash());

// Global variables for colors
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}.....`));
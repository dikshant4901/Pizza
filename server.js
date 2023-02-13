require("dotenv").config();
const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path");
const expressLayout = require("express-ejs-layouts");
const PORT = process.env.PORT || 3300;
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("express-flash");
const MongoStore = require("connect-mongo");
const passport = require("passport");

//DataBase Connection
const url = "mongodb://localhost/pizza";
mongoose.set("strictQuery", true);
mongoose.connect(url, {
  useNewUrlParser: true, //This flag allows users to fall back to the old parser if they find a bug in the server

  useUnifiedTopology: true, // fully support the drivers Server Discovery and Monitoring, Server Selection and Max Staleness
});

const connection = mongoose.connection;
connection
  .once("open", () => {
    console.log("Database connected...");
  })
  .on("error", function (err) {
    console.log(err);
  });




//Session store
// const mongoStore = new MongoDbStore({
//   mongooseConnection: connection,
//   collection: "sessions",
// });
//Session Config
//It act as middleware
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, //24hours
    store: MongoStore.create({
      mongoUrl: process.env.Mongo_URI,
    }),
  })
);


  //Passport config
  const passportInit=require('./app/config/passport');
  passportInit(passport);
  app.use(passport.initialize());
  app.use(passport.session());

app.use(flash()); //Flash is an extension of connect-flash with the ability to define a flash message and render it without redirecting the request.

//Assets
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Global middleware
app.use((req, res, next) => {
  res.locals.session = req.session
  res.locals.user = req.user
  next();
});


//Set Template Engine
app.use(expressLayout);
app.set("views", path.join(__dirname, "/resources/views"));
app.set("view engine", "ejs");

require("./routes/web")(app);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

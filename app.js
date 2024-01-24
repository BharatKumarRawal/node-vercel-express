require("dotenv").config();

const express = require("express");
const expressLayout = require("express-ejs-layouts");
const connectDB = require("./server/config/db");
const cookieparse = require("cookie-parser");
const MongoStore = require("connect-mongo");
const session = require("express-session");
const methodOverride = require("method-override");
const { isActiveRoute } = require("./server/helpers/routeHelpers");

connectDB();

const app = express();

const PORT = 5000 || process.env.PORT;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieparse());
app.use(
  session({
    secret: "keyword cat",
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
  })
);
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.locals.isActiveRoute = isActiveRoute;
//templating Engine
app.use(expressLayout);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");

//
app.use("/", require("./server/routes/main"));
app.use("/", require("./server/routes/admin"));

app.listen(PORT, () => {
  console.log(`App listening on port number ${PORT}`);
});

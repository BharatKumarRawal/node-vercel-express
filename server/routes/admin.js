require("dotenv").config();
const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const adminLayout = "../views/layouts/admin";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//authoraization middleware
const auth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

router.get("/admin", async (req, res) => {
  //rendering local data into to the ejs templates
  try {
    const locals = {
      title: "Admin",
      description: "Simple blog created using NodeJs, expressJs and Mongodb",
    };

    res.render("admin/index", { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

//check admin // login //post
router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      res.status(401).json({ message: "Invalid login credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid login credentials" });
    }

    const token = await jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});

//check admin // register //post
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashPassword = await bcrypt.hash(password, 10);
    try {
      const user = User.create({ username, password: hashPassword });
      res.status(201).json({ message: "User Created", user: user });
    } catch (error) {
      if (error.code === 11000) {
        res.status(409).json({ message: "User already in Use" });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  } catch (error) {
    console.log(error);
  }
});

router.get("/dashboard", auth, async (req, res) => {
  //rendering local data into to the ejs templates
  try {
    const data = await Post.find();
    res.render("admin/dashboard", { data, layout: adminLayout });
  } catch (e) {}
});

router.get("/add-post", auth, async (req, res) => {
  //rendering local data into to the ejs templates
  try {
    const locals = {
      title: "Add Post",
      description: "Simple blog created using NodeJs, expressJs and Mongodb",
    };

    res.render("admin/add-post", { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

//adding new post into the database
router.post("/add-post", auth,async (req, res) => {
  //rendering local data into to the ejs templates
  try {
    try {
      const newPost = new Post({
        title: req.body.title,
        body: req.body.body,
      });
      await Post.create(newPost);
      res.redirect("/dashboard");
    } catch (e) {
      console.log(e);
    }
  } catch (error) {
    console.log(error);
  }
});

//updating  post into the database
router.put("/edit-post/:id",auth, async (req, res) => {
  //rendering local data into to the ejs templates
  try {
    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      createdAt: Date.now(),
    });
    res.redirect(`/edit-post/${req.params.id}`);
  } catch (error) {
    console.log(error);
  }
});

//get edit post
router.get("/edit-post/:id", async (req, res) => {
  //rendering local data into to the ejs templates
  try {
    const data = await Post.findOne({ _id: req.params.id });
    res.render("admin/edit-post", { data, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});
//GET , POST. _id vua admin
router.get("/post/:id", auth, async (req, res) => {
  try {
    //rendering local data into to the ejs templates
    let slug = req.params.id;
    const data = await Post.findById({ _id: slug }); // rendering data from the database
    const locals = {
      title: data.title,
      description: "Simple blog created using NodeJs, expressJs and Mongodb",
    };
    res.render("post", { locals, data, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

//deleteing post , POST. _id vua admin
router.delete("/delete-post/:id", auth, async (req, res) => {
  try {
    let slug = req.params.id;
    await Post.deleteOne({
      _id: slug,
    });
    res.redirect("/dashboard");
  } catch (e) {}
});

//logout

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

module.exports = router;

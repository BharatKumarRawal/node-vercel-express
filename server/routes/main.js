const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

//Routes
//GET
//Home
router.get("/", async (req, res) => {
  //rendering local data into to the ejs templates
  try {
    const locals = {
      title: "Node Js Blog",
      description: "Simple blog created using NodeJs, expressJs and Mongodb",
    };
    let perPage = 10;
    let page = req.query.page || 1;
    const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    const count = await Post.countDocuments();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render("index", {
      locals,
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
      currentRoute: "/",
    });
  } catch (error) {
    console.log(error);
  }
});

//GET , POST. _id
router.get("/post/:id", async (req, res) => {
  try {
    //rendering local data into to the ejs templates
    let slug = req.params.id;
    const data = await Post.findById({ _id: slug }); // rendering data from the database
    const locals = {
      title: data.title,
      description: "Simple blog created using NodeJs, expressJs and Mongodb",
    };
    res.render("post", { locals, data, currentRoute: `/post/${slug}` });
  } catch (error) {
    console.log(error);
  }
});

//GET , POST serachterm
router.post("/search", async (req, res) => {
  try {
    const locals = {
      title: "Search",
      description: "Simple blog created using NodeJs, expressJs and Mongodb",
    };

    let searchTerm = req.body.searchTerm;
    const searchNoSpecailChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "");
    const data = await Post.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecailChar, "i") } },
        { body: { $regex: new RegExp(searchNoSpecailChar, "i") } },
      ],
    });

    res.render("search", {
      data,
      locals,
    });
  } catch (error) {
    console.log(error);
  }
});

//*********No pagination */
// router.get("/", async (req, res) => {
//   const locals = {
//     title: "Node Js Blog",
//     description: "Simple blog created using NodeJs, expressJs and Mongodb",
//   };
//   //rendering local data into to the ejs templates
//   try {
//     const data = await Post.find(); // rendering data from the database
//     res.render("index", { locals, data });
//   } catch (error) {
//     console.log(error);
//   }
// });

router.get("/about", (req, res) => {
  res.render("about", { currentRoute: "/about" });
});

// //post data into the cloud database
// function insertPostData() {
//   Post.insertMany([
//     {
//       title: "Building a blog",
//       body: "This is a body text",
//     },
//     {
//       title: "Building a computer",
//       body: "This is a body text",
//     },
//   ]);
// }
// insertPostData();

module.exports = router;

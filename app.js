const express = require("express");
const validator = require("validator");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const UserSchema = require("./UserSchema");
const session = require("express-session");
const mongoDBSession = require("connect-mongodb-session")(session);
const jwt = require("jsonwebtoken");

//models
const TodoModel = require("./models/TodoModel");

//middlewares
const {
  cleanUpAndValidate,
  cleanUpAndValidateProfile,
  jwtSign,
  sendVerifcationEmail,
} = require("./utils/AuthUtils");
const isAuth = require("./middleware/isAuth");
const rateLimitng = require("./middleware/rateLimiting");

const app = express();

app.set("view engine", "ejs");

// connection with mongoose
mongoose.set("strictQuery", false);
const mongoURI = `mongodb+srv://meet:12345@cluster0.twhduo8.mongodb.net/test`;
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    console.log("Connect to DB successfully");
  })
  .catch((err) => {
    console.log("Failed to connect", err);
  });

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

//Adding the session

const store = new mongoDBSession({
  uri: mongoURI,
  collection: "sessions",
});

app.use(
  session({
    secret: "hello backendjs",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.get("/", (req, res) => {
  res.send("Welcome to my app");
});

app.get("/login", (req, res) => {
  return res.render("login");
});

app.get("/registration", (req, res) => {
  return res.render("register");
});

app.post("/profile", isAuth, async (req, res) => {
  // console.log(req.body);
  const { name, username, phone, email, password, college, state, country } =
    req.body;

  try {
    await cleanUpAndValidateProfile({ password, college, state, country });
  } catch (err) {
    return res.send({
      status: 400,
      message: err,
    });
  }

  const hashedPassword = await bcrypt.hash(password, 7);

  let user = new UserSchema({
    name: name,
    username: username,
    password: hashedPassword,
    email: email,
    phone: phone,
    emailAuthenticated: false,
    college: college,
    state: state,
    country: country,
  });

  let userExists;
  try {
    userExists = await UserSchema.findOne({ email });
  } catch (err) {
    return res.send({
      status: 400,
      message: "User not found",
      error: err,
    });
  }

  if (userExists) {
    try {
      userExists = await UserSchema.findOneAndUpdate(
        { email: email },
        {"$set": { password: hashedPassword, college: college, state: state, country: country }},
      );
      return res.send({
        status: 200,
        message: "Details updated",
      });
    } catch (err) {
      return res.send({
        status: 400,
        message: "Details not updated, Please try again",
        error: err,
      });
    }
  }


});

app.post("/registration", async (req, res) => {
  console.log(req.body);
  const { name, email, username, phone, password } = req.body;
  try {
    await cleanUpAndValidate({ name, password, email, username, phone });
  } catch (err) {
    return res.send({
      status: 400,
      message: err,
    });
  }

  const hashedPassword = await bcrypt.hash(password, 7);

  let user = new UserSchema({
    name: name,
    username: username,
    password: hashedPassword,
    email: email,
    phone: phone,
    emailAuthenticated: false,
    college: "",
    state: "",
    country: "",
  });

  //check if the user already exits
  let userExists;
  try {
    userExists = await UserSchema.findOne({ email });
  } catch (err) {
    return res.send({
      status: 400,
      message: "Internal server error, Please try again",
      error: err,
    });
  }

  if (userExists) {
    return res.send({
      status: 400,
      message: "User already exists",
    });
  }

  // generate a token
  const verificationToken = jwtSign(email);
  console.log(verificationToken);
  try {
    const userDB = await user.save();
    console.log(userDB);
    // res.redirect("/login");
    sendVerifcationEmail(email, verificationToken);

    return res.send({
      status: 200,
      message:
        "Verification has been sent to your mail Id. Please verify before login",
      data: {
        _id: userDB._id,
        username: userDB.username,
        email: userDB.email,
      },
    });
  } catch (err) {
    return res.send({
      status: 400,
      message: "Internal Server Error, Please try again",
      error: err,
    });
  }
});

app.get("/verifyEmail/:id", (req, res) => {
  const token = req.params.id;
  console.log(req.params);
  jwt.verify(token, "backendnodejs", async (err, verifiedJwt) => {
    if (err) res.send(err);

    console.log(verifiedJwt);

    const userDb = await UserSchema.findOneAndUpdate(
      { email: verifiedJwt.email },
      { emailAuthenticated: true }
    );
    console.log(userDb);
    if (userDb) {
      return res.status(200).redirect("/login");
    } else {
      return res.send({
        status: 400,
        message: "Invalid Session link",
      });
    }
  });
  return res.status(200);
});

app.post("/login", async (req, res) => {
  console.log(req.session);
  const { loginId, password } = req.body;

  if (
    typeof loginId !== "string" ||
    typeof password !== "string" ||
    !loginId ||
    !password
  ) {
    return res.send({
      status: 400,
      message: "Invalid Data",
    });
  }

  let userDB;

  try {
    if (validator.isEmail(loginId)) {
      userDB = await UserSchema.findOne({ email: loginId });
    } else {
      userDB = await UserSchema.findOne({ username: loginId });
    }

    console.log(userDB);

    if (!userDB) {
      return res.send({
        status: 400,
        message: "User not found, Please register first",
        error: err,
      });
    }

    // check for email authentication
    if (userDB.emailAuthenticated === false) {
      return res.send({
        status: 400,
        message: "Please verifiy your mailid",
      });
    }

    // compare the password
    const isMatch = await bcrypt.compare(password, userDB.password);

    if (!isMatch) {
      return res.send({
        status: 400,
        message: "Invalid Password",
        data: req.body,
      });
    }

    req.session.isAuth = true;
    req.session.user = {
      username: userDB.username,
      email: userDB.email,
      userId: userDB._id,
    };

    res.redirect("/profile");
  } catch (err) {
    return res.send({
      status: 400,
      message: "Internal Server Error, Please loggin again!",
      error: err,
    });
  }
});

app.get("/home", isAuth, (req, res) => {
  if (req.session.isAuth) {
    return res.send({
      message: "This is your home page",
    });
  } else {
    return res.send({
      message: "Please login again",
    });
  }
});

app.post("/logout", isAuth, rateLimitng, (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;

    res.redirect("/login");
  });
});

app.post("/logout_from_all_devices", isAuth, rateLimitng, async (req, res) => {
  console.log(req.session.user.username);
  const username = req.session.user.username;

  const Schema = mongoose.Schema;
  const sessionSchema = new Schema({ _id: String }, { strict: false });
  const SesisonModel = mongoose.model("session", sessionSchema);

  try {
    const sessionDb = await SesisonModel.deleteMany({
      "session.user.username": username,
    });
    console.log(sessionDb);
    return res.send({
      status: 200,
      message: "Logged out from all devices",
    });
  } catch (err) {
    return res.send({
      status: 400,
      message: "Logout from all devices failed",
      error: err,
    });
  }
});

app.get("/dashboard", isAuth, async (req, res) => {
  res.render("dashboard");
});

app.post("/profileDetails", isAuth, async (req, res) => {
  try {
    let currUser = await UserSchema.find({ username: req.session.user.username });
    return res.send({
        status: 200,
        message: "Read successful",
        data: currUser
    })
  } catch (err) {
    return res.send({
      status: 400,
      message: "Database Error. Please try again",
    });
  }
})

app.post("/pagination_dashboard", isAuth, rateLimitng, async (req, res) => {
  const skip = req.query.skip || 0;
  const LIMIT = 5;
  const username = req.session.user.username;

  //mongodb aggregation -> is we want to perform multiple actions in db, then we use aggregation
  try {
    let todos = await TodoModel.aggregate([
      { $match: { username: username } },
      {
        $facet: {
          data: [{ $skip: parseInt(skip) }, { $limit: LIMIT }],
        },
      },
    ]);

    return res.send({
      status: 200,
      message: "Read Successfully",
      data: todos,
    });
  } catch (err) {
    return res.send({
      status: 400,
      message: "Database error. Please try again",
      error: err,
    });
  }
});

app.post("/create-item", isAuth, rateLimitng, async (req, res) => {
  console.log(req.body);
  const todoText = req.body.todo;

  if (!todoText) {
    return res.send({
      status: 400,
      message: "Missing Parameters",
    });
  }

  if (todoText.length > 100) {
    return res.send({
      status: 400,
      message: "Todo text is very long. Max 100 characters allowd.",
    });
  }

  let todo = new TodoModel({
    todo: todoText,
    username: req.session.user.username,
  });

  try {
    const todoDb = await todo.save();
    return res.send({
      status: 200,
      message: "Todo created successfully",
      data: todoDb,
    });
  } catch (err) {
    return res.send({
      status: 400,
      message: "Database error, Please Try again.",
    });
  }
});

app.post("/edit-item", isAuth, rateLimitng, async (req, res) => {
  const id = req.body.id;
  const newData = req.body.newData;
  console.log(req.body);
  if (!id || !newData) {
    return res.send({
      status: 404,
      message: "Missing Paramters.",
      error: "Missing todo data",
    });
  }

  try {
    const todoDb = await TodoModel.findOneAndUpdate(
      { _id: id },
      { todo: newData }
    );
    return res.send({
      status: 200,
      message: "Updated todo succesfully",
      data: todoDb,
    });
  } catch (err) {
    return res.send({
      status: 400,
      message: "Database error, Please Try again.",
      error: err,
    });
  }
});

app.post("/delete-item", isAuth, rateLimitng, async (req, res) => {
  const id = req.body.id;
  console.log(req.body);
  if (!id) {
    return res.send({
      status: 404,
      message: "Missing parameters",
      error: "Missing id of todo to delete",
    });
  }

  try {
    const todoDb = await TodoModel.findOneAndDelete({ _id: id });

    return res.send({
      status: 200,
      message: "Todo Deleted Succesfully",
      data: todoDb,
    });
  } catch (err) {
    return res.send({
      status: 400,
      message: "Database error. Please try again.",
      error: err,
    });
  }
});

app.get("/profile", isAuth, (req, res) => {
  return res.render("profile");
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Listenning on port ${PORT}`);
});

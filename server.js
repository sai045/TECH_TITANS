const express = require("express");
const app = express();
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");
const flash = require("express-flash");
const passport = require("passport");
const session = require("express-session");
const bodyparser = require("body-parser");
const path = require("path");

const initializePassport = require("./passportConfig");
const { Events } = require("pg");

initializePassport(passport);

app.use(bodyparser.json());

app.set("views", path.join(__dirname, "views"));
// console.log(path.join(__dirname, "views"))
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "secret",

    resave: false,

    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/home", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/dashboard", async (req, res) => {
  res.render("dashboard", { user: req.user.name, events: req.user.events });
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/event", (req, res) => {
  res.render("event");
});

app.get("/cooking", (req, res) => {
  res.render("cooking");
});

app.get("/art", (req, res) => {
  res.render("art");
});

app.get("/music", (req, res) => {
  res.render("music");
});

app.get("/fashion", (req, res) => {
  res.render("fashion");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.get("/gallery", (req, res) => {
  res.render("gallery");
});

app.post("/signup", async (req, res) => {
  let { name, batch, year, email, password, password2 } = req.body;

  console.log({
    name,
    batch,
    year,
    email,
    password,
    password2,
  });

  let errors = [];

  if (password.length < 6) {
    errors.push({ message: "password should have more than 6 characters" });
  }

  if (password != password2) {
    errors.push({ message: "passwords should match" });
  }

  if (errors.length > 0) {
    res.render("signup", { errors });
  } else {
    let hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);

    pool.query(
      `SELECT * FROM users
            WHERE email = $1`,
      [email],
      (err, results) => {
        if (err) {
          throw err;
        }

        console.log(results.rows);

        if (results.rows.length > 0) {
          res.render("signup", { errors });
        } else {
          pool.query(
            `INSERT INTO users (name, batch, year, email, password)
                        VALUES ($1, $2, $3, $4, $5)
                        RETURNING password`,
            [name, batch, year, email, hashedPassword],
            (err, results) => {
              if (err) {
                console.log(err);
                throw err;
              }
              console.log(results.rows);
              req.flash("success_msg", "you are now registered. Please Login");
              res.redirect("login");
            }
          );
        }
      }
    );
  }
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "dashboard",
    failureRedirect: "login",
    failureFlash: true,
    // session: false,
  })
);

app.post("/register", async (req, res) => {
  let { name, email, age, batch, events } = req.body;

  console.log({
    name,
    email,
    age,
    batch,
    events,
  });
  pool.query(
    `UPDATE users SET events = $1 WHERE email = $2;`,
    [events, email],
    (err, results) => {
      if (err) {
        throw err;
      }
      console.log(results.rows);
      req.flash("success_msg", "you are now registered");
      res.redirect("register");
    }
  );
});

app.post("/contact", async (req, res) => {
  let { email, message } = req.body;

  console.log({
    email,
    message,
  });
  pool.query(
    `INSERT INTO contact (email,message)
        VALUES ($1, $2)`,
    [email, message],
    (err, results) => {
      if (err) {
        throw err;
      }
      console.log(results.rows);
      res.redirect("contact");
    }
  );
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`server running at port ${PORT}`);
});
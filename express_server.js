const express = require("express");
const app = express();
const PORT = 8081; // default port 8081
const bodyParser = require("body-parser");
//const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const {
  findUserByEmail,
  generateRandomString,
  findShortUrlInUrlDatabase,
  urlsForUser,
} = require("./helpers");
const { urlDatabase, users } = require("./examples/dataBase");

app.set("view engine", "ejs");



app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());

app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "blah"],
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
);

//Home page
app.get("/", (req, res) => {
  const userID = req.session.userId;
  //console.log("line 34", userID);
  const user = users[userID];

  if (!user) {
    return res.redirect("/login");
  }

  return res.redirect("/urls");
});


app.get("/urls", (req, res) => {
  const userID = req.session.userId;
  const user = users[userID];

  const urlsToDisplay = urlsForUser(userID, urlDatabase);
  const templateVars = {
    user,
    urls: urlsToDisplay,
  };
  
  res.render("urls_index", templateVars);
});

// paired link forms
app.get("/urls/new", (req, res) => {
  const userID = req.session.userId;
  const user = users[userID];
  
  if (!user) {
    res.redirect("/login");
    return null;
  }

  const templateVars = {
    user,
    URLS: urlDatabase,
  };
  res.render("urls_new", templateVars);
});

// shortened pair route
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.userId;
  const user = users[userID];

  if (!user) {
    return res.redirect("/urls");
  }

  if (!findShortUrlInUrlDatabase(shortURL, urlDatabase)) {
    return res.status(404).send("Such shortURL is not found in your account");
  }

  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(404).send("Cannot access url with this email id");
  }

  const templateVars = {
    user,
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
  };

  res.render("urls_show", templateVars);
});

// Add new set of links
app.post("/urls", (req, res) => {
  const userID = req.session.userId;
  const user = users[userID];

  if (!user) {
    return res.status(403).send("User needs to be logged in.");
  }

  let shortURLGenerated = generateRandomString();
  const longURL = req.body.longURL;

  urlDatabase[shortURLGenerated] = {
    longURL,
    userID
  };

  res.redirect(`/urls/${shortURLGenerated}`);
});

// Update long link
app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.userId;
  const user = users[userID];

  if (!user) {
    return res.status(403).send("User needs to be logged in to delete urls");
  }

  const shortURL = req.params.shortURL;

  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(403).send("Users can edit only their own urls!");
  }

  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;

  res.redirect("/urls");
});

// Redirecting to long URL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!findShortUrlInUrlDatabase(shortURL, urlDatabase)) {
    return res.status(404).send("Such shortURL is not found");
  }

  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Delete from database
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.userId;
  const user = users[userID];

  if (!user) {
    return res.status(403).send("Only registred users can delete urls!");
  }

  const shortURL = req.params.shortURL;

  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(403).send(`User does not own ${shortURL}.User can only delete their own urls!`);
  }

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// Login form
app.get("/login", (req, res) => {
  const userID = req.session.userId;
  const user = users[userID];

  if (user) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user,
  };
  res.render("urls_login", templateVars);
});

// Logout
app.post("/logout", (req, res) => {
  req.session = null;

  
  
  res.redirect("/urls/");
});


app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  //1. Check for the Empty
  if (!email || !password) {
    return res.status(400).send("email and password cannot be blank");
  } else {
    //if the username and password are not empty
    const user = findUserByEmail(email, users);
    if (user) {
      //if the user is returned then I want to check for the password
      const checkPassword = bcrypt.compareSync(password, user.hashedPassword);
      if (!checkPassword) {
        return res.status(403).send("Incorrect email/password");
      } else {
        //everything is fine. Create a session and then send the user to the urls/
        console.log("user ", user);
        req.session.userId = user.userID;
        res.redirect("/urls/");
      }
    } else {
      return res.status(404).send("User with this email does not exist");
    }
  }
});

// Register form
app.get("/register", (req, res) => {
  const userID = req.session.userId;
  const user = users[userID];

  if (user) {
    return res.redirect('/urls');
  }

  const templateVars = {
    user,
  };
  res.render("urls_register", templateVars);
});


app.post("/register", (req, res) => {
  let userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  
  if (!email || !password) {
    return res
      .status(400)
      .send(
        '<html><body>Please login/register using <b><a href="/urls">email & password!! </a></b></body></html>\n '
      );
  }
    
  const user = findUserByEmail(email, users);
    
  if (user) {
    return res.status(403).send("User already exists");
  }
    
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[userID] = {
    userID,
    email,
    hashedPassword,
  };

  req.session.userId = userID;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Tinny app is listening on port ${PORT}!`);
});

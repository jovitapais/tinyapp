//Dependencies
const express = require("express");
const PORT = 8081; // default port 8081
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');

//const res = require("express/lib/response");
const {urlDatabase,users} = require('./examples/dataBase.js');

//Server Setup
app.set("view engine", "ejs"); //set up/build/render pages using view engine
app.use(bodyParser.urlencoded({ extended: true }));//middleware that passes the incoming request bodies before we use it
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ["blah1", "blah2"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
const { findUserByEmail, generateRandomString,
  findShortUrlInUrlDatabase,
  urlsForUser } = require('./helpers');

//*************GET requests/Routes*****************

app.get("/", (req, res) => {
  const userID = req.session.userId;
  console.log("this is ",userID);
  const user = users[userID];
  if (user) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});


app.get("/urls", (req, res) => {
  const userID = req.session.userId;
  const user = users[userID];
  
  let urlsToDisplay = urlsForUser(userID, urlDatabase);

  const templateVars = {urlsToDisplay, user};

  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const userID = req.session.userId;
  const user = users[userID];
  
  if (!user) {
    res.statusMessage = 'User is not logged in.';
    return res.redirect('/login');
  }
  const templateVars = {user};
  res.render("urls_new", templateVars);
});


//pairing with the second route

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const userID = req.session.userId;
  const user = users[userID];

  if (!user) {

    return res.status(403).send('User needs to register/login').redirect('/login');
  }
  if (!findShortUrlInUrlDatabase(shortURL, urlDatabase)) {
    return res.status(404).send(`urls/${shortURL} does not exist`);
  }
  
  const templateVars = {user,shortURL,longURL};

  res.render("urls_show", templateVars);
  
});


app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;

  if (!findShortUrlInUrlDatabase(shortURL, urlDatabase)) {
    return res.status(404).send(`/u/{shortURL} is not found.`);
  }

  res.redirect(longURL);
});


//adding additional endpoints
app.get("/urls.json", (req, res) => {
  
  res.json(urlDatabase);
});

app.get('/users.json', (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/:id", (req, res) => {
  res.send("Register or Login Above 🔔");
});

app.get("/register", (req, res) => {
  const userID = req.session.userId;
  const user = users[userID];

  if (user) {
    return res.redirect('/urls');
  }

  const templateVars = {user};
  res.render("urls_register", templateVars);
});


app.get("/login", (req, res) => {
  const userID = req.session.userId;
  const user = users[userID];

  if (user) {
    return res.redirect('/login');
  }

  const templateVars = {user};
  res.render("urls_login", templateVars);
});


//****POST routes***

app.post("/urls", (req, res) => {
  const userID = req.session.userId;
  const user = users[userID];
  const longURL = req.body.longURL;
  const randomShortURL = generateRandomString();

  if (!user) {
    res.status(403).send("User needs to be logged in.");
    return res.redirect('/login');
  }

  urlDatabase[randomShortURL] = {longURL, userID};

  res.redirect(`/urls/${randomShortURL}`);
});

//deleting url from database
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.userId;
  const user = users[userID];
  const shortURL = req.params.shortURL;

  if (!user) {
    return res.status(403).send("User needs to be logged in to delete urls");
  }

  if (!urlDatabase[shortURL]) {
    return res.status(400).send(`/urls/${shortURL}/delete does not exist.`);
  }

  if (urlDatabase[shortURL].userID !== userID) {
    return res.status(400).send(`User does not own ${shortURL}.User can only delete their own urls!`);
  }
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});


app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.userId;
  const user = users[userID];

  if (!user) {
    return res.status(403).send("User needs to be logged in to access urls");
  }

  if (!urlDatabase[shortURL]) {
    return res.status(400).send(`/urls/${shortURL}/ does not exist.`);
  }

  if (urlDatabase[shortURL].userID !== userID) {
    return res.status(400).send(`User does not own ${shortURL}.User can only access their own urls!`);
  }

});


app.post("/register", (req, res) => {
  let userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email, users);
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    return res.status(400).send("<html><body>Please login/register using <b><a href=\"/urls\">email & password!! </a></b></body></html>\n ");
  }

  if (user) {
    return res.status(403).send("User with such e-mail already exists");
  }

  users[userID] = {
    id: userID,
    email: email,
    password: hashedPassword
  };
  req.session.userId = userID;
  res.redirect('/urls');
});


app.post("/login", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  const checkPassword = bcrypt.compareSync(password, user.hashedPassword);
  const user = findUserByEmail(email, users);
  
  if (!user) {
    return res.status(404).send("User with such e-mail is not found");
  }

  if (!checkPassword) {
    return res.status(403).send("Password does not mutch");
  }

  req.session.userId = user.id;
  res.redirect('/urls/');
});



app.post("/logout", (req, res) => {
  delete req.session.userId;
  res.redirect(`/urls`);
});


app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});


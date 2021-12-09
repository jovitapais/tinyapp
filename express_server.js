//Dependencies
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const {getUserByEmail} = require("./helpers");
//const res = require("express/lib/response");


//Server Setup
const app = express();
const PORT = 8081; // default port 8081
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};
//Routes

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls", (req, res) => { //const templateVars
  //console.log("This is users object:", users);//test that the user_id cookie is being set correctly upon redirection
  // eslint-disable-next-line camelcase
  const user_id = req.cookies["user_id"];
  console.log("username:",user_id);
  // eslint-disable-next-line camelcase
  const user = users[user_id];
  console.log("The user should be this:", user);
  const templateVars = {
    urls: urlDatabase,
    user: user,
  };
  
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["user_id"];
  const templateVars = {
    urls: urlDatabase,
    user: users[user_id],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  // console.log(req.body);   // Log the POST request body to the console
  const shortURL = req.params.shortURL; //keys
  const userId = req.cookies["user_id"];
  // eslint-disable-next-line camelcase
  const user = users[userId];
  const longURL = urlDatabase[shortURL];  //values
  const templateVars = { shortURL: shortURL, longURL: longURL,user: user };
  res.render("urls_show", templateVars);
  // let shortURLGenerated = generateRandomString();
  // console.log(shortURLGenerated);
  // res.redirect(`/urls/${shortURLGenerated}`);
});
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  // console.log(longURL);
  res.redirect(longURL);
});
  
app.get("/urls.json", (req, res) => { //adding additional endpoints
  res.json(urlDatabase);
});
app.get("/register", (req, res) => {
  //const username = req.cookies["user_id"]; //got the cookie value/name
  // eslint-disable-next-line camelcase
  const user_id = req.cookies["user_id"];
  //console.log("username:",user_id);
  // eslint-disable-next-line camelcase
  const user = users[user_id];
  //console.log("The user should be this:", user);
  const templateVars = {
    user: user, //value is the line 74
  };
  res.render("registration",templateVars); //type the file path without .ejs extension
});
app.get("/login", (req, res) => { //form urls_login for new user
  res.render("urls_login", { user: null });
});

//POST routes

app.post("/register", (req, res) => { //Create a Registration Handler
  const id = generateRandomString();
  // console.log("reg body:", req.body);
  const {email, password} = req.body; //same as line 86 & 87
  if (!email || !password) {
    res.send("<html><body>You need to fill out both <b><a href=\"/urls\">email & password!! </a></b></body></html>\n ");
    return res.status(403);
  }
  const user = getUserByEmail(email, users);
  if (user) {
    res.send("User Already exists!");
    return;
  }
  users[id] = {
    id,
    email,
    password,
  };
  res.cookie("user_id", id);  //this is the cookie container,res.cookie("this is a cookie key", cookie value)
  // console.log(users);
  res.redirect('/urls');
  // const email = req.body.email;
  // const password = req.body.password;
});
app.post("/urls/", (req, res) => {
  const longURL = req.body.longURL;
  let shortURLGenerated = generateRandomString();
  console.log(shortURLGenerated);
  urlDatabase[shortURLGenerated] = longURL;
  //const templateVars = { shortURL, longURL };
  //console.log(req.body);  // Log the POST request body to the console
  res.redirect(`/urls/${shortURLGenerated}`);
});
app.post("/urls/:shortURL/delete", (req, res) => { //deleting a URL resource
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

app.post("/urls/:id", (req, res) => { //edit
  const shortURL = req.params.id;
  const newLongURL = req.body.newLongURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect(`/urls`);
});

// app.post("/login", (req,res) => {
//   const userName = req.body.userName; //input field
//   console.log("user name is ,",userName);
//   res.cookie("user_id", userName);  //res.cookie("this is a cookie key", cookie value)
//   res.redirect(`/urls`);
// });
app.post("/login", (req, res) => {   //Form: posts to Login
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  if (!email && !password) {
    res.statusCode = 400;
    res.statusMessage = 'Email and password cannot be blank.';
    return res.send('Email and password cannot be blank.');
  }

  if (!email) {
    res.statusCode = 400;
    res.statusMessage = 'Email cannot be blank.';
    return res.send('Email cannot be blank.');
  }

  if (!password) {
    res.statusCode = 400;
    res.statusMessage = 'Password cannot be blank.';
    return res.send('Password cannot be blank.');
  }

  if (!user) {
    res.statusCode = 403;
    res.statusMessage = `${email} is not associated with any user.`;
    return res.send(`${email} is not associated with any user.`);
  }
});
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// eslint-disable-next-line func-style
function generateRandomString() {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 6; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}
// /*const generateRandomString = function() {
//   return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(0,11);
  
// };*/
// let string = generateRandomString();
// console.log("**%&46", string);
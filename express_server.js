//Dependencies
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { findUserByEmail, generateRandomString,
  findShortUrlInUrlDatabase,
  urlsForUser } = require('./helpers');
//const res = require("express/lib/response");
const {urlDatabase,users} = require('./Examples/dataBase.js');

//Server Setup
const app = express();
const PORT = 8081; // default port 8081
app.set("view engine", "ejs"); //set up/build/render pages using view engine
app.use(bodyParser.urlencoded({ extended: true }));//middleware that passes the incoming request bodies before we use it
app.use(cookieParser());


//*************GET requests/Routes*****************

app.get("/", (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];
  if (!user) {
    res.statusMessage = 'Client is not logged in';
    return res.redirect('/login');
  }
  res.redirect('/urls');
});


app.get("/urls", (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];
  
  let urlsToDisplay = urlsForUser(userID, urlDatabase);

  const templateVars = {urlsToDisplay, user};

  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];
  
  if (!user) {
    res.statusMessage = 'Client is not logged in.';
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

    return res.status(404).send('User needs to register/login').redirect('/login');
  }
  if (!findShortUrlInUrlDatabase(shortURL, urlDatabase)) {
    return res.status(404).send(`urls/${shortURL} does not exist`);
  }
  
  const templateVars = {user,shortURL,longURL};

  res.render("urls_show", templateVars);
  
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});



app.get("/u/:shortURL", (req, res) => {
  // const user_id = req.cookies["user_id"];
  const id = req.cookies.user_id;
  let urlsObj;
  if (id) {
    urlsObj = fetchUserUrls(urlDatabase, id);
  } else {
    urlsObj = fetchAllUrls(urlDatabase);
  }
  const longURL = urlsObj[req.params.shortURL]; //console.log(urlsObj, longURL);   res.redirect(longURL);
  if (longURL == undefined) {
    return res.status(404).send("user Id not found");
  }
  // const longURL = urlDatabase[req.params.shortURL].longURL;
  // const templateVars = {
  // 	urls: urlDatabase,
  // 	user: users[req.cookies["user_id"]],
  
  // };
  // console.log(longURL);
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  //adding additional endpoints
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
    err_msg: "",
  };
  res.render("registration", templateVars); //type the file path without .ejs extension
});

app.get("/login", (req, res) => {
  //form urls_login for new user
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  // res.render("urls_login", { user: null });
  const templateVars = {
    user: user, //value is the line 74
    err_msg: "",
  };
  res.render("urls_login", templateVars); //type the file path without .ejs extension
});

//POST routes

app.post("/register", (req, res) => {
  //Create a Registration Handler
  const id = generateRandomString();
  // console.log("reg body:", req.body);
  const { email, password } = req.body; //same as line 86 & 87
  if (!email || !password) {
    res.send(
      '<html><body>You need to fill out both <b><a href="/urls">email & password!! </a></b></body></html>\n '
    );
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
  res.cookie("user_id", id); //this is the cookie container,res.cookie("this is a cookie key", cookie value)
  console.log("users are:", users);
  res.redirect("/urls");
  // const email = req.body.email;
  // const password = req.body.password;
});
// app.post("/urls/:id/delete", (req,res) => {
//   let cookieVal = req.cookies.user_id;
//   if(cookieVal == null) {
//     return res.redirect("/login");
//   }
//   const idToDelete = req.params.id;
//   const userURL = fetchUserUrlsObj(urlDatabase, cookieVal);
//   for (let shortUrl in userURL) {
//     if(shortURL == idToDelete) {
//       delete urlDatabase[idToDelete]
//     }
//   }
// });
app.post("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];
  if (user_id == null) {
    return res.redirect("/login");
  }
  const longURL = req.body.longURL;
  let shortURLGenerated = generateRandomString();
  console.log(shortURLGenerated);
  urlDatabase[shortURLGenerated] = { longURL, userID: user_id };
  //const templateVars = { shortURL, longURL };
  //console.log(req.body);  // Log the POST request body to the console
  res.redirect(`/urls/${shortURLGenerated}`);
});

//EDIT
app.post("/urls/:id", (req, res) => {
  const user_id = req.cookies["user_id"];
  if (user_id == null) {
    return res.redirect("/login");
  }
  const shortURL = req.params.id;
  const newLongURL = req.body.newLongURL;
  const usersUrls = fetchUserUrls(urlDatabase, user_id);
  for (let shorturl in usersUrls) {
    if (shorturl == shortURL) {
      urlDatabase = {
        ...urlDatabase,
        [shortURL]: { longURL: newLongURL, userID: user_id },
      };
      return res.redirect("/urls");
    }
  }
  // urlDatabase[shortURL] = newLongURL;
  // res.redirect(`/urls`);
});

// app.post("/login", (req,res) => {
//   const userName = req.body.userName; //input field
//   console.log("user name is ,",userName);
//   res.cookie("user_id", userName);  //res.cookie("this is a cookie key", cookie value)
//   res.redirect(`/urls`);
// });
app.post("/login", (req, res) => {
  //Form: posts to Login
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email, users);

  if (!email || !password) {
    return res.status(400).send("<html><body>You need to fill out both <b><a href=\"/urls\">email & password!! </a></b></body></html>\n ");
  }
  if (user) {
    return res.status(403).send("User with such e-mail already exists");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  //deleting a URL resource
  const user_id = req.cookies["user_id"];
  if (user_id == null) {
    return res.redirect("/login");
  }
  const shortURL = req.params.shortURL;
  const userUrls = fetchUserUrls(urlDatabase, user_id);
  for (let shorturl in userUrls) {
    if (shorturl == shortURL) {
      delete urlDatabase[shortURL];
      res.redirect(`/urls`);
      // return res.end("/urls");
    }
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// eslint-disable-next-line func-style

// /*const generateRandomString = function() {
//   return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(0,11);

// };*/
// let string = generateRandomString();
// console.log("**%&46", string);

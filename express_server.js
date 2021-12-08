const express = require("express");
const app = express();
const PORT = 8081; // default port 8081
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
//const res = require("express/lib/response");


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};


//Routes

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls", (req, res) => {
  const username = req.cookies["userName"];
  const templateVars = {
    urls: urlDatabase,
    username: username,
  };
  
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  // console.log(req.body);   // Log the POST request body to the console
  const shortURL = req.params.shortURL; //keys
  const longURL = urlDatabase[shortURL];  //values
  const templateVars = { shortURL: shortURL, longURL: longURL };
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

//POST routes

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

app.post("/login", (req,res) => {
  const userName = req.body.userName; //input field
  console.log("user name is ,",userName);
  res.cookie("userName", userName);  //res.cookie("this is a cookie key", cookie value)
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
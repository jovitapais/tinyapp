// Find user in database by email
const findUserByEmail = function(email, users) {
  for (let userID in users) {
    let user = users[userID];
    if (user.email === email) {
      return user;
    }
  }
};

// Random string generator

// eslint-disable-next-line func-style
function generateRandomString() {
  const chars =
		"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 6; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

// Checks if such short URL exists
const findShortUrlInUrlDatabase = function(shortURL, database) {
  let urlDatabaseKeys = Object.keys(database);
  for (let urlToCheck of urlDatabaseKeys) {
    if (urlToCheck === shortURL) {
      return true;
    }
  }
  return false;
};

// URLs for display selector
const urlsForUser = (id, database) => {
  let urls = {};

  for (const shortURL in database) {
    if (database[shortURL]["userId"] === id) {
      urls[shortURL] = database[shortURL].longURL;
    }
  }

  return urls;
};

module.exports = { findUserByEmail, generateRandomString, findShortUrlInUrlDatabase, urlsForUser };
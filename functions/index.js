const functions = require("firebase-functions");
const { getUser, addNewUser } = require("./controllers/Login");
const getItemsList = require("./controllers/Items");

exports.addUser = functions.https.onRequest((request, response) => {
  addNewUser(request, response);
});

exports.userType = functions.https.onRequest((req, res) => {
  getUser(req, res);
});

exports.items = functions.https.onRequest((req, res) => {
  getItemsList(req, res);
});

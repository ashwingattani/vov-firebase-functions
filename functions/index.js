const functions = require("firebase-functions");
const { getUser, addNewUser } = require("./controllers/Login");
const { getItemsList, createItem } = require("./controllers/Items");
const {
  createOrder,
  getOrderList,
  updateOrder,
} = require("./controllers/Order");

exports.addUser = functions.https.onRequest((request, response) => {
  addNewUser(request, response);
});

exports.userType = functions.https.onRequest((req, res) => {
  console.log("user type");

  getUser(req, res);
});

exports.items = functions.https.onRequest((req, res) => {
  getItemsList(req, res);
});

exports.addItem = functions.https.onRequest((req, res) => {
  createItem(req, res);
});

exports.addOrder = functions.https.onRequest((req, res) => {
  createOrder(req, res);
});

exports.orders = functions.https.onRequest((req, res) => {
  getOrderList(req, res);
});

exports.updateOrder = functions.https.onRequest((req, res) => {
  updateOrder(req, res);
});

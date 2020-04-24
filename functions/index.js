const functions = require("firebase-functions");
const { getUser, addNewUser, updateUser } = require("./controllers/Users");
const { getItemsList, createItem } = require("./controllers/Items");
const {
  createOrder,
  getOrderList,
  udpateOrderStatus,
  updateOrderItems,
  currentOpenOrders,
  previousOrders,
} = require("./controllers/Orders");

exports.addUser = functions.https.onRequest((request, response) => {
  addNewUser(request, response);
});

exports.userType = functions.https.onRequest((req, res) => {
  getUser(req, res);
});

exports.updateUser = functions.https.onRequest((req, res) => {
  updateUser(req, res);
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

exports.updateOrderItems = functions.https.onRequest((req, res) => {
  updateOrderItems(req, res);
});

exports.udpateOrderStatus = functions.https.onRequest((req, res) => {
  udpateOrderStatus(req, res);
});

exports.currentOrders = functions.https.onRequest((req, res) => {
  currentOpenOrders(req, res);
});

exports.orderHistory = functions.https.onRequest((req, res) => {
  previousOrders(req, res);
});

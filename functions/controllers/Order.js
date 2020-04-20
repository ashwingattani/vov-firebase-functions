const database = require("../setup/setup");

const { COLLECTIONS, ORDER_STATUS } = require("../utility/constants");
const {
  createItemOrder,
  updateItemsForOrderId,
  getItemsForOrderId,
} = require("./ItemOrders");

const createOrder = (req, res) => {
  if (req.method !== "POST") {
    res.status(400).send("Please send POST request");
  }

  let order = {
    customer: req.body.customer,
    sellerId: "", //Id of seller based on pin code, to be set hardcode for as we have only one seller
    status: ORDER_STATUS.OPEN,
    date: new Date().toISOString()(),
  };

  let doc = database.collection(COLLECTIONS.ORDERS).doc();

  doc
    .set(order)
    .then(() => {
      req.body.items.forEach((item) => {
        item.orderId = doc.id;
        createItemOrder(item);
      });
      res.status(200).send({ ...order, id: doc.id });
      return;
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

const getOrderList = (req, res) => {
  if (req.method !== "GET") {
    res.status(400).send("Please send GET request");
  }

  let key = req.body.userType == "consumer" ? "customerId" : "sellerId";
  let userId = req.body.userId;

  let ordersRef = db.collection(COLLECTIONS.ORDERS);
  ordersRef
    .where(key, "==", userId)
    .get()
    .then((snapshot) => {
      let orders = [];
      if (snapshot.empty) {
        res.status(204).send("No Orders Found");
        return;
      }

      snapshot.forEach((doc) => {
        let order = doc.data();
        order.id = doc.id;
        order.items = getItemsForOrderId(order.id)
          ? getItemsForOrderId(order.id)
          : [];
        orders.push(order);
      });
      res.status(200).send(orders);
      return;
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

const currentOpenOrders = (req, res) => {
  if (req.method !== "GET") {
    res.status(400).send("Please send GET request");
  }

  let key = req.body.userType == "consumer" ? "customerId" : "sellerId";
  let userId = req.body.userId;

  let ordersRef = db.collection(COLLECTIONS.ORDERS);
  ordersRef
    .where(key, "==", userId)
    .where("status", "==", ORDER_STATUS.OPEN)
    .get()
    .then((snapshot) => {
      let orders = [];
      if (snapshot.empty) {
        res.status(204).send("No Orders Found");
        return;
      }

      snapshot.forEach((doc) => {
        let order = doc.data();
        order.id = doc.id;
        order.items = getItemsForOrderId(order.id)
          ? getItemsForOrderId(order.id)
          : [];
        orders.push(order);
      });
      res.status(200).send(orders);
      return;
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

const previousOrders = (req, res) => {
  if (req.method !== "GET") {
    res.status(400).send("Please send GET request");
  }

  let key = req.body.userType == "consumer" ? "customerId" : "sellerId";
  let userId = req.body.userId;

  let ordersRef = db.collection(COLLECTIONS.ORDERS);
  ordersRef
    .where(key, "==", userId)
    .where("status", "in", [ORDER_STATUS.OPEN, ORDER_STATUS.FAILED])
    .get()
    .then((snapshot) => {
      let orders = [];
      if (snapshot.empty) {
        res.status(204).send("No Orders Found");
        return;
      }

      snapshot.forEach((doc) => {
        let order = doc.data();
        order.id = doc.id;
        order.items = getItemsForOrderId(order.id)
          ? getItemsForOrderId(order.id)
          : [];
        orders.push(order);
      });
      res.status(200).send(orders);
      return;
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

const updateOrder = (req, res) => {
  if (req.method !== "UPDATE") {
    res.status(400).send("Please send UPDATE request");
  }

  if (updateItemsForOrderId(req.body.orderId, req.body.items)) {
    res.status(200).send("Order updated successfully");
  } else {
    res.status(400).send("Error updating order");
  }
};

module.exports = {
  createOrder,
  getOrderList,
  updateOrder,
  currentOpenOrders,
  previousOrders,
};

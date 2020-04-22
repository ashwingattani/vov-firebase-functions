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
    sellerId: "Gg1TRCgVolq38IIT2gTh", //Id of Suresh Subziwala, later will add logic to assign seller based on pincode
    status: ORDER_STATUS.OPEN,
    date: new Date().toISOString(),
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

  let key = req.query.userType == "consumer" ? "customer.id" : "sellerId";
  let userId = req.query.userId;

  let ordersRef = database.collection(COLLECTIONS.ORDERS);
  ordersRef.where(key, "==", userId);

  getOrdersFromRef(ordersRef, req, res);
};

const currentOpenOrders = (req, res) => {
  if (req.method !== "GET") {
    res.status(400).send("Please send GET request");
  }

  let key = req.query.userType == "consumer" ? "customer.id" : "sellerId";
  let userId = req.query.userId;

  console.log("key", key, "userId", userId);

  let currentRef = database.collection(COLLECTIONS.ORDERS);
  currentRef.where(key, "==", userId).where("status", "==", ORDER_STATUS.OPEN);

  getOrdersFromRef(currentRef, req, res);
};

const previousOrders = (req, res) => {
  if (req.method !== "GET") {
    res.status(400).send("Please send GET request");
  }

  let key = req.query.userType == "consumer" ? "customer.id" : "sellerId";
  let userId = req.query.userId;

  let prevRef = database.collection(COLLECTIONS.ORDERS);
  prevRef
    .where(key, "==", userId)
    .where("status", "in", [ORDER_STATUS.DELIVERED, ORDER_STATUS.FAILED]);

  getOrdersFromRef(prevRef, req, res);
};

const getOrdersFromRef = (ref, req, res) => {
  ref
    .get()
    .then((snapshot) => {
      let orders = [];
      if (snapshot.empty) {
        res.status(204).send("No Orders Found");
        return;
      }

      let docs = snapshot.docs;

      docs.map(async (doc, index) => {
        let order = doc.data();
        order.id = doc.id;
        await getItemsForOrderId(order.id).then((items) => {
          order.items = items;
          orders.push(order);
        });
        if (index == docs.length - 1) {
          res.status(200).send(orders);
          return;
        }
      });
    })
    .catch((err) => {
      console.log("error", err);
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

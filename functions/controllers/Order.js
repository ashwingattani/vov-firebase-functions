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

  let key = req.query.userType == "consumer" ? "customer.id" : "sellerId";
  let userId = req.query.userId;

  console.log("key", key, "userId", userId);

  let ordersRef = database.collection(COLLECTIONS.ORDERS);
  ordersRef
    .where(key, "==", userId)
    .where("status", "==", ORDER_STATUS.OPEN)
    .get()
    .then(async (snapshot) => {
      let orders = [];
      if (snapshot.empty) {
        res.status(204).send("No Orders Found");
        return;
      }
      let docs = snapshot.docs;
      docs.map(async (doc, index) => {
        console.log("map", index);

        let order = doc.data();
        order.id = doc.id;
        let items = await getItemsForOrderId(order.id);
        console.log("items", items);

        order.items = items;
        orders.push(order);
      });
      // snapshot.forEach(async (doc) => {

      // });
      console.log("orders", orders);

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

  let key = req.query.userType == "consumer" ? "customerId" : "sellerId";
  let userId = req.query.userId;

  let ordersRef = database.collection(COLLECTIONS.ORDERS);
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

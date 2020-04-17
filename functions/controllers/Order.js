const database = require("../setup/setup");

const { COLLECTIONS, ORDER_STATUS } = require("../utility/constants");
const { createItemOrder, updateItemsForOrderId } = require("./ItemOrders");

const createOrder = (req, res) => {
  if (req.method !== "POST") {
    res.status(400).send("Please send POST request");
  }

  let order = {
    customerId: req.body.customerId,
    sellerId: req.body.sellerId,
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
      res.status(200).send({ orderId: doc.id });
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
        orders.push({ ...doc.data, id: doc.id });
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

module.exports = { createOrder, getOrderList, updateOrder };

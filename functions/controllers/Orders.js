const { database } = require("../setup/setup");

const { COLLECTIONS, ORDER_STATUS } = require("../utility/constants");
const {
  createItemOrder,
  updateItemsForOrderId,
  getItemsForOrderId,
} = require("./ItemOrders");
const { getNearestSeller } = require("./Users");

const createOrder = (req, res) => {
  if (req.method !== "POST") {
    res.status(400).send("Please send POST request");
    return;
  }

  console.log("calling getNearestSeller");
  getNearestSeller()
    .then((seller) => {
      console.log("found seller", seller);
      let order = {
        customer: req.body.customer,
        sellerId: seller.id, //Id of Suresh Subziwala, later will add logic to assign seller based on pincode
        status: ORDER_STATUS.OPEN,
        date: new Date().toISOString(),
      };

      console.log("further process");
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
          console.log("error", err);
          res.status(400).send(err);
          return;
        });
    })
    .catch((err) => {
      console.log("error", err);
      res.status(400).send("No Seller Available at this moment");
      return;
    });
};

const getOrderList = (req, res) => {
  if (req.method !== "GET") {
    res.status(400).send("Please send GET request");
    return;
  }

  let key = req.query.userType == "consumer" ? "customer.id" : "sellerId";
  let userId = req.query.userId;

  let ordersRef = database.collection(COLLECTIONS.ORDERS);
  ordersRef.where(key, "==", userId);

  getOrdersFromRef(ordersRef, res);
};

const currentOpenOrders = (req, res) => {
  if (req.method !== "GET") {
    res.status(400).send("Please send GET request");
    return;
  }

  let key = req.query.userType == "consumer" ? "customer.id" : "sellerId";
  let userId = req.query.userId;

  let currentRef = database.collection(COLLECTIONS.ORDERS);
  currentRef.where(key, "==", userId).where("status", "==", ORDER_STATUS.OPEN);

  getOrdersFromRef(currentRef, res);
};

const previousOrders = (req, res) => {
  if (req.method !== "GET") {
    res.status(400).send("Please send GET request");
    return;
  }

  let key = req.query.userType == "consumer" ? "customer.id" : "sellerId";
  let userId = req.query.userId;

  let prevRef = database.collection(COLLECTIONS.ORDERS);
  prevRef
    .where(key, "==", userId)
    .where("status", "in", [ORDER_STATUS.DELIVERED, ORDER_STATUS.FAILED]);

  getOrdersFromRef(prevRef, res);
};

const getOrdersFromRef = (ref, res) => {
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
      return;
    });
};

const udpateOrderStatus = (req, res) => {
  if (req.method !== "POST") {
    res.status(400).send("Please send POST request");
    return;
  }

  let order = Object.assign({}, req.body);
  delete order.items;
  delete order.id;

  database
    .collection(COLLECTIONS.ORDERS)
    .doc(req.body.id)
    .update(order)
    .then(() => {
      res.status(200).send("Order updated successfully");
    })
    .catch((err) => {
      console.log("error", err);
      res.status(400).send("Error updating order");
      return;
    });
};

const updateOrderItems = (req, res) => {
  if (req.method !== "POST") {
    res.status(400).send("Please send POST request");
    return;
  }

  if (updateItemsForOrderId(req.body.id, req.body.items)) {
    res.status(200).send("Order updated successfully");
    return;
  } else {
    res.status(400).send("Error updating order");
    return;
  }
};

module.exports = {
  createOrder,
  getOrderList,
  udpateOrderStatus,
  updateOrderItems,
  currentOpenOrders,
  previousOrders,
};

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

  // Check if an order is already OPEN
  database
    .collection(COLLECTIONS.ORDERS)
    .where("status", "==", ORDER_STATUS.OPEN)
    .where("customer.id", "==", req.body.customer.id)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        // Create new order as there are no open orders
        getNearestSeller()
          .then((seller) => {
            let order = {
              customer: req.body.customer,
              sellerId: seller.id, //Id of Suresh Subziwala, later will add logic to assign seller based on pincode
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
      } else {
        // Update the open order with new items
        let openOrderDoc = snapshot.docs[0];
        updateOrderItems(
          {
            method: req.method,
            body: { id: openOrderDoc.id, items: req.body.items },
          },
          res
        );
      }
    })
    .catch((err) => {
      console.log("Fetching open orders failed", err);
      res.status(400).send(err);
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
  let myCurrentRef = currentRef.where(key, "==", userId);
  let openCurrentRef = myCurrentRef.where("status", "==", "open");

  getOrdersFromRef(openCurrentRef, res);
};

const previousOrders = (req, res) => {
  if (req.method !== "GET") {
    res.status(400).send("Please send GET request");
    return;
  }

  let key = req.query.userType == "consumer" ? "customer.id" : "sellerId";
  let userId = req.query.userId;

  let prevRef = database.collection(COLLECTIONS.ORDERS);
  let myprevRef = prevRef.where("status", "in", [
    ORDER_STATUS.CLOSED,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.FAILED,
  ]);
  let closedPrevRef = myprevRef.where(key, "==", userId);

  getOrdersFromRef(closedPrevRef, res);
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

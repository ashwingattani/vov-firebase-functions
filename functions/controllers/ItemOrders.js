const { database } = require("../setup/setup");
const { COLLECTIONS } = require("../utility/constants");

const createItemOrder = async (item) => {
  let doc = database.collection(COLLECTIONS.ITEM_ORDERS).doc();

  return doc
    .set(item)
    .then(() => {
      return true;
    })
    .catch((err) => {
      console.log("error", err);
      return false;
    });
};

const updateItemsForOrderId = (req, res) => {
  let items = req.body.items;
  let orderId = req.body.id;

  let itemOrdersRef = database.collection(COLLECTIONS.ITEM_ORDERS);

  itemOrdersRef
    .where("orderId", "==", orderId)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        items.map((item) => {
          item.orderId = orderId;
          createItemOrder(item);
        });
        res.status(200).send("Order updated successfully");
        return;
      } else {
        let docs = snapshot.docs;

        // check if there are common items in docs and items.
        items.map(async (item, index) => {
          item.orderId = orderId;
          let availableItem = docs.find((doc) => {
            return doc.data().id == item.id;
          });

          if (availableItem) {
            await database
              .collection(COLLECTIONS.ITEM_ORDERS)
              .doc(availableItem.id)
              .update(item)
              .then()
              .catch((err) => {
                console.log(err);
                res.status(400).send("Error updating order");
                return;
              });
          } else {
            await createItemOrder(item);
          }
          if (index == items.length - 1) {
            res.status(200).send("Order updated successfully");
            return;
          }
        });
      }
    })
    .catch((err) => {
      console.log("error", err);
      res.status(400).send("Error updating order");
      return;
    });
};

const getItemsForOrderId = async (orderId) => {
  let itemOrdersRef = database.collection(COLLECTIONS.ITEM_ORDERS);

  return itemOrdersRef
    .where("orderId", "==", orderId)
    .get()
    .then((snapshot) => {
      let items = [];
      snapshot.forEach((doc) => {
        let item = { ...doc.data(), id: doc.id };
        items.push(item);
      });
      return items;
    })
    .catch((err) => {
      console.log("getItemsForOrderId error", err);
      return [];
    });
};

module.exports = { createItemOrder, updateItemsForOrderId, getItemsForOrderId };

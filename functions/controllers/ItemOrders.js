const database = require("../setup/setup");
const { COLLECTIONS } = require("../utility/constants");

const createItemOrder = (item) => {
  let doc = database.collection(COLLECTIONS.ITEM_ORDERS).doc();

  doc
    .set(item)
    .then()
    .catch((err) => {
      return err;
    });
};

const updateItemsForOrderId = (orderId, items) => {
  let itemOrdersRef = database.collection(COLLECTIONS.ITEM_ORDERS);

  itemOrdersRef
    .where("orderId", "==", orderId)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        return false;
      } else {
        snapshot.forEach((item) => {
          let updatedItem = items.find($0.id === item.id);
          database
            .collection(COLLECTIONS.ITEM_ORDERS)
            .doc(item.id)
            .update(updatedItem);
        });
        return true;
      }
    })
    .catch(() => {
      return false;
    });
};

const getItemsForOrderId = (orderId) => {
  let itemOrdersRef = database.collection(COLLECTIONS.ITEM_ORDERS);

  itemOrdersRef
    .where("orderId", "==", orderId)
    .get()
    .then((snapshot) => {
      let items = [];
      snapshot.forEach((doc) => {
        items.push({ ...doc.data(), id: doc.id });
      });
      return items;
    })
    .catch((err) => {
      console.log("getItemsForOrderId error", err);
      return false;
    });
};

module.exports = { createItemOrder, updateItemsForOrderId, getItemsForOrderId };

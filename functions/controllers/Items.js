const database = require("../setup/setup");
const COLLECTIONS = require("../utility/constants");

const getItemsList = (req, res) => {
  if (req.method !== "GET") {
    res.status(400).send("Please send a GET request");
    return;
  }

  database
    .collection(COLLECTIONS.ITEMS)
    .get()
    .then((snapshot) => {
      let items = [];
      snapshot.forEach((doc) => {
        let item = doc.data();
        item.id = doc.id;
        items.push(item);
      });
      if (items.length > 0) {
        res.status(200).send(items);
      } else {
        res.status(204).send("No Items Found");
      }
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

const createItem = (item) => {
  database
    .collection(COLLECTIONS.ITEM_ORDERS)
    .doc()
    .set(item)
    .then()
    .catch((err) => {
      return err;
    });
};

module.exports = { getItemsList, createItem };

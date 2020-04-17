const database = require("../setup/setup");
const { COLLECTIONS } = require("../utility/constants");

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

const createItem = (req, res) => {
  if (req.method !== "POST") {
    res.status(400).send("Please send a GET request");
    return;
  }

  let doc = database.collection(COLLECTIONS.ITEMS).doc();

  doc
    .set(req.body)
    .then(() => {
      res.status(200).send({ itemId: doc.id });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

module.exports = { getItemsList, createItem };

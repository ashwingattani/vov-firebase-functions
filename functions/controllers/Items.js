const database = require("../setup/setup");

const getItemsList = (req, res) => {
  if (req.method !== "GET") {
    res.status(400).send("Please send a GET request");
    return;
  }

  database
    .collection("item")
    .get()
    .then((snapshot) => {
      let items = [];
      snapshot.forEach((doc) => {
        items.push(doc.data());
      });
      res.status(200).send(items);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

module.exports = getItemsList;

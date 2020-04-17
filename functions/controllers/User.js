const database = require("../setup/setup");

const getUserForId = (id) => {
  database
    .collection()
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.id == id) {
          return doc.data();
        }
      });
      return null;
    })
    .catch((err) => {
      return err;
    });
};

module.exports = getUserForId;

const { database } = require("../setup/setup");

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
      console.log("error", err);
      return err;
    });
};

module.exports = getUserForId;

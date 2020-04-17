const database = require("../setup/setup");
const COLLECTIONS = require("../utility/constants");

const getUser = (req, res) => {
  if (req.method !== "GET") {
    res.status(400).send("Please send a GET request");
    return;
  }

  let usersRef = database.collection(COLLECTIONS.USERS);

  usersRef
    .where(key, "==", userId)
    .get()
    .then((snapshot) => {
      let mobileNumber = req.query.mobileNumber,
        user = undefined;

      snapshot.forEach((doc) => {
        if (doc.data().mobileNumber == mobileNumber) {
          user = doc.data();
          user.id = doc.id;
        }
      });
      if (user) {
        res.status(200).send(user);
        return;
      } else {
        res.status(204).send("User Not Found");
        return;
      }
    })
    .catch((err) => {
      res.status(400).send(err);
      return;
    });
};

const addNewUser = (req, res) => {
  if (req.method !== "POST") {
    res.status(400).send("Please send a POST request");
    return;
  }

  let newUser = {
    name: req.body.name,
    mobileNumber: req.body.mobileNumber,
    type: req.body.type,
    houseNumber: req.body.houseNumber,
    houseName: req.body.houseName,
    street: req.body.street,
    pincode: req.body.pincode,
    location: {
      _latitude: req.body.location.latitude,
      _longitude: req.body.location.longitude,
    },
  };

  let doc = database.collection(COLLECTIONS.USERS).doc();

  doc
    .set(newUser)
    .then(() => {
      res.status(200).send({ userId: doc.id });
      return;
    })
    .catch((err) => {
      res.status(400).send(err);
      return;
    });
};

module.exports = { getUser, addNewUser };

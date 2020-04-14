const database = require("../setup/setup");

const getUserType = (req, res) => {
  if (req.method !== "GET") {
    res.status(400).send("Please send a GET request");
    return;
  }

  let mobileNumber = req.query.mobileNumber,
    user = undefined;

  database
    .collection("users")
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.data().mobileNumber == mobileNumber) {
          user = doc.data();
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

  database
    .collection("users")
    .doc()
    .set(newUser)
    .then(() => {
      res.status(200).send(newUser);
      return;
    })
    .catch((err) => {
      res.status(400).send(err);
      return;
    });
};

module.exports = { getUserType, addNewUser };

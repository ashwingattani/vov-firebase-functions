const database = require("../setup/setup");
const { COLLECTIONS } = require("../utility/constants");

const getUser = (req, res) => {
  if (req.method !== "GET") {
    res.status(400).send("Please send a GET request");
    return;
  }

  let usersRef = database.collection(COLLECTIONS.USERS);

  usersRef
    .where("mobileNumber", "==", req.query.mobileNumber)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        res.status(204).send("User Not Found");
        return;
      } else {
        res.status(200).send(snapshot.docs[0].data());
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

  let usersRef = database.collection(COLLECTIONS.USERS);

  usersRef
    .where("mobileNumber", "==", req.body.mobileNumber)
    .get()
    .then((snapshot) => {
      if (!snapshot.empty) {
        res.status(400).send("User already exists, Please login to continue");
        return;
      } else {
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
            console.log("error in addition", err);
            res.status(400).send(err);
            return;
          });
      }
    })
    .catch((err) => {
      console.log("error in save", err);

      res.status(400).send(err);
      return;
    });
};

module.exports = { getUser, addNewUser };

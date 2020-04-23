const { database } = require("../setup/setup");
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
        let user = snapshot.docs[0].data();
        user.id = snapshot.docs[0].id;
        res.status(200).send(user);
        return;
      }
    })
    .catch((err) => {
      console.log("error", err);
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
        let newUser = req.body;
        let doc = database.collection(COLLECTIONS.USERS).doc();

        doc
          .set(newUser)
          .then(() => {
            newUser.id = doc.id;
            res.status(200).send(newUser);
            return;
          })
          .catch((err) => {
            console.log("error while adding new user", err);
            res.status(400).send(err);
            return;
          });
      }
    })
    .catch((err) => {
      console.log("error while fetching users in addNewUser", err);

      res.status(400).send(err);
      return;
    });
};

module.exports = { getUser, addNewUser };

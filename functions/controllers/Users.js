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

const getUserForId = (id) => {
  database
    .collection(COLLECTIONS.USERS)
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

const getNearestSeller = async (pincode) => {
  let user = undefined;
  return database
    .collection(COLLECTIONS.USERS)
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.id == "Gg1TRCgVolq38IIT2gTh" && doc.data().isOnline) {
          console.log("found user");
          user = { ...doc.data(), id: doc.id };
        }
      });
      return user;
    })
    .catch((err) => {
      console.log("error", err);
      return user;
    });
};

const updateUser = (req, res) => {
  if (req.method !== "POST") {
    res.status(400).send("Please send POST request");
    return;
  }

  let user = Object.assign({}, req.body);
  delete user.id;

  database
    .collection(COLLECTIONS.USERS)
    .doc(req.body.id)
    .update(user)
    .then(() => {
      res.status(200).send("User updated successfully");
    })
    .catch((err) => {
      console.log("error", err);
      res.status(400).send(err);
    });
};

module.exports = {
  getUser,
  addNewUser,
  getUserForId,
  getNearestSeller,
  updateUser,
};

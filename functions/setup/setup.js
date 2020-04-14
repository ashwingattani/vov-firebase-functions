const admin = require("firebase-admin");
// const cors = require("cors")({ origin: true });

var serviceAccount = require("./com-atizriicon-vov-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://com-atizriicon-vov.firebaseio.com",
});

let database = admin.firestore();

module.exports = database;

var admin = require('firebase-admin');

var serviceAccount = require('./cognetic-service-admin.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://cognetic-memory.firebaseio.com'
});

let defaultAuth = admin.auth();
let defaultDatabase = admin.database();
let firestore = admin.firestore();

let exceptionHandler = function(e) {
    console.log(e);
};

let playerScore = function (score, collections) {
    console.log(collections.id);
    for (let collection of collections) {
        console.log(`collection with ref: ${collection.id}`);
        collection.get().then(playerScoreDocs.bind(null, score)).catch(exceptionHandler)
    }
};

let printScore = function (scores, score) {
  scores.scores.push(score.data());
  let path = `scores/${scores.id}/scores`;
  console.log(`path $path`);
  console.log(scores.scores);
  let collectionRef = firestore.collection(path);
  scores.scores.forEach(function (val) {
      collectionRef.add(val).then(function (result) {
          console.log(result);
      }).catch(function (e) {
          console.log(`${e.getMessage()}`);
      })
  });
};

let playerScoreDocs = function (score, querySnapshot) {
    querySnapshot.forEach(function (docRef) {
        console.log(`docs ${docRef.id}`);
        docRef.ref.get().then(printScore.bind(null, score));
    });
};

let players = function(querySnapshot) {
    querySnapshot.forEach(playerScores);
};

let playerScores = function (documentSnapshot) {
    console.log(`doc id : ${documentSnapshot.id}`);
    let score = {id: documentSnapshot.id, scores: []};
    if (documentSnapshot.ref !== undefined) {
        documentSnapshot.ref.getCollections().then(playerScore.bind(null, score)).catch(function (e) {
            console.log(e);
        });
    } else {
        console.log(documentSnapshot.data());
    }
};


let collectionRef = firestore.collection('scores');
collectionRef.get().then(players);

/**
 * // collection.doc().get().then(function (querySnapshot) {
        //     console.log(`collection ${collection.id} of ${querySnapshot.id} and size ${querySnapshot.size}`);
        //     querySnapshot.get().then(function (querySnapshotDoc) {
        //         console.log(querySnapshotDoc.id);
        //         // for (let snap of querySnapshotDoc) {
        //         //     console.log(snap.data());
        //         // }
        //     }).catch(function (e) {
        //         console.log(e);
        //     });
        // }).catch(function (e) {
        //     console.log(e);
        // })
 // collection.ref.get().then(function (documentSnapshot) {
        //     scores.push(documentSnapshot.data());
        // }).finally(function () {
        //     console.log(scores);
        // })
 */

// getCollections().then(function (data) {
//     console.log(data.length);
// });
//console.log();

//console.log(defaultDatabase.ref("scores").documents());
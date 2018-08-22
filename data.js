const admin = require('firebase-admin');
var serviceAccount = require('./firebase-admin.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

var db = admin.firestore();

var docRef = db.collection('colors').doc('master');

var setAda = docRef.set({
        'en' : ["black", "red", "blue", "yellow"],
        'th' : ["ฟ้า", "เหลือง", "แดง", "ดำ"],
        'si' : ["කළු", "රතු", "නිල්", "කහ"],
        'tm' : ["கருப்பு", "சிவப்பு", "நீலம்", "மஞ்சள்"],
        'bg' : ["কালো", "লাল", "নীল", "হলুদ"]
    }
);
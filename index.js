var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var port = 2000;
var app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/maps', function (req, res) {
  MongoClient.connect('mongodb://localhost:27017/journeylearner', function(err, db) {
    if (err) {
      throw err;
    }
    db.collection('maps').find().toArray(function(err, result) {
      if (err) {
        throw err;
      }
      console.log('Get request to maps API: /maps');
      res.send(result);
    });
  });
});

app.listen(port, function () {
  console.log('Maps API listening on port ' + port + '!');
});

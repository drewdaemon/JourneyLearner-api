var express = require('express');
var mongoose = require('mongoose');
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;
var app = express();

var mapSchema = mongoose.Schema({
  id: Number,
  title: String,
  description: String,
  author: String,
  image: String,
  dimensions: [Number],
  points: [{ x: Number, y: Number }],
  datapoints: [{}],
  created: { type: Date, default: Date.now }
});

var Map = mongoose.model('Map', mapSchema);

// var map = new Map({
//   id: 2,
//   title: 'Marco Polo\'s Journey to the East',
//   description: 'He went!',
//   author: 'Andrew Tate',
//   image: 'marco.png',
//   dimensions: [700, 400],
//   points: [
//     { x: 50, y: 29 },
//     { x: 100, y: 50 },
//     { x: 120, y: 80 },
//     { x: 300, y: 100 },
//     { x: 330, y: 130 },
//     { x: 330, y: 150 },
//     { x: 330, y: 180 },
//   ],
//   datapoints: [{}]
// });

// map.save();

mongoose.connect(process.env.MONGODB_URI);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/maps', function (req, res) {
  Map.find(function (err, maps) {
    if (err) return handleError(err);
    console.log('Get request to maps API: /maps');
    res.send(maps);
  });
});

app.post('/maps', function (req, res) {
  var map = new Map(req.data);
  map.save(function (err) {
    if (err) return handleError(err);
    console.log('Saved ' + map.title + ' by ' + map.author);
  });
});

app.listen(port, function () {
  console.log('Maps API listening on port ' + port + '!');
});

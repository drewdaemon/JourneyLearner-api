var express = require('express');
var mongoose = require('mongoose');
var aws = require('aws-sdk');
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;
var app = express();

var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
var S3_BUCKET = process.env.S3_BUCKET;

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

app.get('/sign_s3', function(req, res){
  aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
  var s3 = new aws.S3();
  var s3_params = {
    Bucket: S3_BUCKET,
    Key: req.query.file_name,
    Expires: 60,
    ContentType: req.query.file_type,
    ACL: 'public-read'
  };
  s3.getSignedUrl('putObject', s3_params, function(err, data){
    if(err){
      console.log(err);
    }
    else{
      var return_data = {
        signed_request: data,
        url: 'https://'+S3_BUCKET+'.s3.amazonaws.com/'+req.query.file_name
      };
      res.write(JSON.stringify(return_data));
      res.end();
    }
  });
});

app.listen(port, function () {
  console.log('Maps API listening on port ' + port + '!');
});

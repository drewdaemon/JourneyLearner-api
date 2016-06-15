var express = require('express');
var mongoose = require('mongoose');
var aws = require('aws-sdk');
var bodyParser = require('body-parser')

// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;
var app = express();

app.use( bodyParser.json() );       // to support JSON-encoded bodies

var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
var S3_BUCKET = process.env.S3_BUCKET;

var mapSchema = mongoose.Schema({
  id: Number,
  title: String,
  description: String,
  author: String,
  image: String,
  points: [{ x: Number, y: Number }],
  datapoints: [{ coords: [Number], desc: String }],
  dimensions: [Number],
  created: { type: Date, default: Date.now }
});

var Map = mongoose.model('Map', mapSchema);

mongoose.connect(process.env.MONGODB_URI);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/maps', function (req, res) {
  Map.find(function (err, maps) {
    if (err) console.log('Error: ' + err);
    console.log('Get request to maps API: /maps');
    res.send(maps);
  });
});

app.post('/maps', function (req, res) {
  var map = new Map(req.body);

  console.log('---------------------------------\n');
  Map.find().count().then(function (count) {
    map.id = count;
    console.log(map);
    map.save(function (err) {
      if (err) {
        console.log('Error: ' + err);
        res.send('Save Failed');
      } else {
        console.log('Saved ' + map.title + ' by ' + map.author);
        res.send(map);
      }
    });
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

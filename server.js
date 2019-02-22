'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
//mongoose.connect(process.env.MONGO_CLUSTER_URI);
var db = require('./database.js') // db connected in database.js

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: 'false'}));
app.use(bodyParser.json());

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});
  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

/** 
The testable api starts here
*/
const dns = require('dns')
const dnsOptions = {
  family: 6,
  hints: dns.ADDRCONFIG | dns.V4MAPPED,
};

var isValidHost = (host) => {
  dns.lookup(host, dnsOptions, (err, address, family) => {
    console.log('address: %j family: IPv%s', address, family)
    if (err) return false
    return true
  });   
}

var saveNewUrl = db.createAndSaveUrl
app.post("/api/shorturl/new", (req, res)=>{
  console.log(req.body)
  var url = req.body.url
  var host = url.replace(/^https?:\/\//,'')
  saveNewUrl(host, (data)=> {
      res.json({short_url: data.short_url, original_url: data.original_url})
    })
  /**
  if (isValidHost(host)) {
    
  } else {
     res.json({error: "invalid URL"}) 
  }
  */
  
})


// Get the short Url
var findByShort = db.findUrlByShort
app.get("/api/shorturl/:short", (req, res, next) => {
  findByShort(req.params.short, (data) => {
    console.log(data)
    //res.json({short_url: data.short_url, original_url: data.original_url})
    res.redirect("http://" + data.original_url)
    
  })
})

app.listen(port, function () {
  console.log('Node.js listening ...');
});
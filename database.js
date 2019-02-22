var mongo = require('mongodb');
var mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_CLUSTER_URI);

var Schema = mongoose.Schema
var urlSchema = new Schema({
  short_url: Number,
  original_url: String
})

var Url = mongoose.model('Url', urlSchema)

function nextShortUrl(){
  Url.count().exec(function(err, result) {
    if(err) return -1;
    return result + 1;
});
}

// validate orig_url before sending to this method
var createAndSaveUrl = (orig_url, done) => {
  Url.estimatedDocumentCount({}).then(count => {
    var url =  new Url({short_url: `${count+1}`,original_url: orig_url})
    url.save((err,data) => {
       if (err) return done(err)
      
       done(data)
     })
  })
  .catch(error => console.error(error))
}
  
var findUrlByShort = (short_url, done) => {
  Url.findOne({short_url: short_url}, (err, data) => {
    if (err) return done(err)
    done(data)
  })
}

exports.createAndSaveUrl = createAndSaveUrl
exports.findUrlByShort = findUrlByShort 
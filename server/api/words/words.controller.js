'use strict';

var _ = require('lodash'),
    redis = require('redis');

// connecting to redis on dev and on heroku
if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redisClient = redis.createClient(rtg.port, rtg.hostname);

  redisClient.auth(rtg.auth.split(":")[1]);
} else {
  var redisClient = redis.createClient();
}

redisClient.on("error", function (err) {
  console.log("error event - " + redisClient.host + ":" + redisClient.port + " - " + err);
});

// Get list of words
exports.index = function(req, res) {
  if (req.query.count !== undefined) {
      var n = parseInt(req.query.count);

      getTopWordsWithCounts(n, res);
  } else {
    res.json([]);
  }
};

function getTopWordsWithCounts(num, res) {
  if (num < 1) {
    return {error: 'invalid number'}
  } else {
    var result = [];

    redisClient.zrevrange('words', 0, num-1, 'withscores', function(error, buffer) {
      if (error !== null) {
        res.json({error: error});
        return
      }
      if (buffer.length < num*2){
        res.json({error: 'Not enough data. Only found ' + buffer.length + ' words.'});
        return
      }
      for (var i = 0; i < buffer.length; i += 2) {
        result.push({
          word: buffer[i],
          count: parseInt(buffer[i+1])
        });
      }
      res.json(result);
    });
  }
}

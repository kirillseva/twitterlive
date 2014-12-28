/**
* All redis related things should happen here
*/

'use strict';

var moment = require('moment'),
    url = require('url'),
    _ = require('lodash'),
    redis = require('redis'),
    redisClient;

// connecting to redis on dev and on heroku
if (process.env.REDISCLOUD_URL) {
  var redisURL = url.parse(process.env.REDISCLOUD_URL);
  var redisClient = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
  redisClient.auth(redisURL.auth.split(":")[1]);
} else {
  var redisClient = redis.createClient();
}

redisClient.on('error', function (err) {
  console.log('error event - ' + redisClient.host + ':' + redisClient.port + ' - ' + err);
});

function cleanup (minutes) {
  var threshold = moment().subtract(minutes, 'minutes').valueOf();
  // get outdated tweets and decrement all words found in them
  redisClient.zrangebyscore('tweets', '-inf', threshold, function(error, buffer) {
    _.each(buffer, function (tweet) {
      _.each(tweet.split(/\s+/), function (word) {
          incrementWordBy(word, -1);
      });
    });
  });
  // now that we have dealt with the words let's remove outdated tweets
  redisClient.zremrangebyscore('tweets', '-inf', threshold);
  // and words that have negative counts
  redisClient.zremrangebyscore('words', '-inf', 0);
}

// We will store tweets along with the timestamp in Redis
function saveTweet (timestamp, text) {
  redisClient.zadd('tweets', timestamp, text);
}

// We will store words along with their appearance count in Redis
// Pass in negative values of count to decrement
function incrementWordBy (word, count) {
  redisClient.zincrby('words', count, word);
}

function getTopWordsWithCounts(num, cb) {
  if (num < 1) {
    return {error: 'invalid number'}
  } else {
    var result = [];

    redisClient.zrevrange('words', 0, num-1, 'withscores', function(error, buffer) {
      if (error !== null) {
        cb({error: error});
        return
      }
      if (buffer.length < num*2){
        cb({error: 'Not enough data. Only found ' + buffer.length + ' words.'});
        return
      }
      for (var i = 0; i < buffer.length; i += 2) {
        result.push({
          word: buffer[i],
          count: parseInt(buffer[i+1])
        });
      }
      cb(result);
    });
  }
}

module.exports = {
  cleanup: cleanup,
  saveTweet: saveTweet,
  incrementWordBy: incrementWordBy,
  getTopWordsWithCounts: getTopWordsWithCounts
};

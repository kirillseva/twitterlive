/**
* Parsing twitter into redis
*/

'use strict';

var redis = require('redis'),
    redisClient = redis.createClient(),
    _ = require('lodash'),
    Twit = require('twit'),
    twitter = new Twit({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token: process.env.TWITTER_ACCESS_TOKEN,
      access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    }),
    stream,
    // twitter stream filter options
    options = {
      track: ['money', 'avant', 'avantcredit'],
      language: 'en'
    },
    streamUrl = 'statuses/filter',
    tweets = {
      start: function () {
        // Start logging the tweets
        stream = twitter.stream(streamUrl, options);
        stream.on('tweet', function (tweet) {
          if (tweet.text !== undefined) {
          //   we are not interested in case sensitive words,
          //   and we also filter out words spammy small words
            var text = pruneString(tweet.text);
            // save words and tweets to Redis
            saveTweet(tweet.timestamp_ms, text);
            _.each(text.split(/\s+/), function (word) {
              incrementWordBy(word, 1);
            });
          }
          // check for expired tweets
        });
      }
    };

redisClient.on("error", function (err) {
  console.log("error event - " + redisClient.host + ":" + redisClient.port + " - " + err);
});

// We will store tweets along with the timestamp in Redis
function saveTweet (timestamp, text) {
  redisClient.zadd('tweets', timestamp, text);
}

// We will store words along with their appearance count in Redis
// Pass in negative values of count to decrement
function incrementWordBy (word, count) {
  redisClient.zincrby('words', count, word);
}

function pruneString (string) {
  var stopwords = [
      'the',
      'mine',
      'your',
      'can',
      'and',
      'with',
      '&amp;',
      'all',
      'have',
      'you',
      'but',
      'for'
    ],
    text = string.toLowerCase()
                 .replace(/\W*\b\w{1,2}\b/g, '');
    _.each(stopwords, function(word) {
      text = text.replace(new RegExp(word, 'g'), '');
    });
  return(text.trim());
}

module.exports = tweets;

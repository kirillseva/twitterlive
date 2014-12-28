/**
* Parsing twitter into redis
*/

'use strict';

var moment = require('moment'),
    url = require('url'),
    redis = require('redis'),
    redisClient,
    _ = require('lodash'),
    Twit = require('twit'),
    twitter = new Twit({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token: process.env.TWITTER_ACCESS_TOKEN,
      access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    }),
    stream,
    MINUTES = 5,
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
            // save the tweet and its words to Redis
            saveTweet(tweet.timestamp_ms, text);
            _.each(text.split(/\s+/), function (word) {
              incrementWordBy(word, 1);
            });
          }
          // check for expired tweets
          cleanup(MINUTES);
        });
      }
    };

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

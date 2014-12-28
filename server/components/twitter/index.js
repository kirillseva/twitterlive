/**
* Parsing twitter into redis
*/

'use strict';

var moment = require('moment'),
    url = require('url'),
    _ = require('lodash'),
    Twit = require('twit'),
    redisHelper = require('../redisHelper'),
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
      track: ['money', 'cash', 'dollar'],
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
            redisHelper.saveTweet(tweet.timestamp_ms, text);
            _.each(text.split(/\s+/), function (word) {
              redisHelper.incrementWordBy(word, 1);
            });
          }
          // check for expired tweets
          redisHelper.cleanup(MINUTES);
        });
      }
    };

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
                 .replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"")
                 .replace(/\s{2,}/g," ")
                 .replace(/\W*\b\w{1,2}\b/g, '');
    _.each(stopwords, function(word) {
      text = text.replace(new RegExp(word, 'g'), '');
    });
  return(text.trim());
}

module.exports = tweets;

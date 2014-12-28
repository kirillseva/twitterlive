'use strict';

var should = require('should'),
    redisHelper = require('../redisHelper'),
    redis = require('redis'),
    url = require('url'),
    assert = require("assert"),
    redisClient;

// connecting to redis on dev and on heroku
if (process.env.REDISCLOUD_URL) {
  var redisURL = url.parse(process.env.REDISCLOUD_URL);
  var redisClient = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
  redisClient.auth(redisURL.auth.split(":")[1]);
} else {
  var redisClient = redis.createClient();
}

describe('redisHelper tests', function() {

  before(function(){
    redisClient.flushdb();
  });

  it('should store tweets in a sorted order, and cleanup will clean it', function(done) {
    //test tweet saving
    redisHelper.saveTweet(10, 'kirill');
    redisClient.zrange('tweets', 0, -1, function(error, buffer) {
      if (error) {
        return;
      }
      assert(buffer.length === 1);
      assert(buffer[0] === 'kirill');
    });

    redisHelper.saveTweet(101, 'testing');
    redisClient.zrange('tweets', 0, -1, function(error, buffer) {
      if (error) {
        return;
      }
      assert(buffer.length === 2);
      assert(buffer[0] === 'kirill');
      assert(buffer[1] === 'testing');
    });

    redisHelper.cleanup(1);
    redisClient.zrange('tweets', 0, -1, function(error, buffer) {
      if (error) {
        return;
      }
      assert(buffer.length === 0);
    });

    //test word saving and retrieving
    redisHelper.incrementWordBy('kirill', 1);
    redisHelper.incrementWordBy('testing', 1);
    redisHelper.incrementWordBy('kirill', 5);
    redisClient.zrange('words', 0, -1, function(error, buffer) {
      if (error) {
        return;
      }
      assert(buffer.length === 2);
      assert(buffer[0] === 'testing');
    });

    redisHelper.incrementWordBy('qwerty', 10);
    redisHelper.getTopWordsWithCounts(3, function(result) {
      assert(result.length === 3);
      assert(result[0].word === 'qwerty');
      assert(result[2].count === 1);
    });

    //cleanup and test that redis is empty
    redisHelper.cleanup(1);
    redisClient.zrange('tweets', 0, -1, function(error, buffer) {
      if (error) {
        return;
      }
      assert(buffer.length === 0);
    });

    done();
  });
});

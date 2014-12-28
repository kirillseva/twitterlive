'use strict';

var redisHelper = require('../../components/redisHelper');

// Get list of words
exports.index = function(req, res) {
  if (req.query.count !== undefined) {
      var n = parseInt(req.query.count);
      redisHelper.getTopWordsWithCounts(n, function(result) {
        res.json(result);
      });
  } else {
    res.json([]);
  }
};

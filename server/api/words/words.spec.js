'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');

describe('GET /api/words', function() {

  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/words')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });

  it('should return an array of objects that have word and count', function(done) {
    request(app)
    .get('/api/words?count=1')
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) return done(err);
      if (res.body.error === undefined){
        res.body[0].word.should.be.instanceof(String);
        res.body[0].count.should.be.instanceof(Number);
      } else {
        res.body.error.should.be.instanceof(String);
      }
      done();
    });
  });
});

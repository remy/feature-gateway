'use strict';
/*global describe:true, it: true, beforeEach:true, afterEach:true */
var assert = require('assert'),
    express = require('express'),
    undefsafe = require('undefsafe'),
    request = require('supertest'),
    Features = require('../lib/');

describe('features flags', function () {

  var features = new Features({
    beta: function (req) {
      return undefsafe(req, 'session.user.beta');
    }
  });

  function getBetaUser() {
    return {
      session: {
        user: {
          beta: true
        }
      }
    };
  }

  it('should give not allow unknown features', function () {
    assert(features('unknown') === false, 'unknown feature are blocked');
  });

  it('should allow beta users', function () {
    var req = getBetaUser();

    assert(features('beta', req) === true, 'beta users allowed');

    req.session.user.beta = false;
    assert(features('beta', req) === false, 'non beta users blocked');

    delete req.session.user.beta;
    assert(features('beta', req) === false, 'non beta (flagless) users blocked');

    delete req.session;
    assert(features('beta', req) === false, 'non logged in users blocked');
  });
});

describe('feature router', function () {
  var app, server;

  var features = new Features({
    beta: function (req) {
      return undefsafe(req, 'session.user.beta');
    }
  });

  beforeEach(function (done) {
    app = express();
    server = app.listen(8000, done);
  });

  afterEach(function () {
    server.close();
  });

  function attachRoutes() {
    app.use(app.router);
    app.get('/', features.route('beta'), function (req, res) {
      res.send(200, 'Hello!');
    });

    app.get('/', function (req, res) {
      res.send(404);
    });
  }

  it('should work as routing middleware', function (done) {
    attachRoutes();
    request(app)
      .get('/')
      .expect(404, done);
  });

  it('should block routes', function (done) {
    app.use(function (req, res, next) {
      req.session = { user: { beta: true } };
      next();
    });

    attachRoutes();

    request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200, done);

  });
});
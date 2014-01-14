'use strict';

function gateway(flag, flags) {
  // remove the first argument and capture the rest
  var args = [].slice.apply(arguments).slice(1);

  var flags = this.flags; // jshint ignore:line

  if (flags[flag]) {
    // support single true/false features
    if (typeof flags[flag] === 'boolean') {
      return flags[flag] || false;
    }

    // otherwise, run the test and return the value
    return !!flags[flag].apply(this, args); // jshint ignore:line
  } else {
    return false;
  }
}

function Features(flags) {
  if (!(this instanceof Features)) {
    return new Features(flags);
  }

  this.flags = flags;

  // I'm not sure I like this, but it's my way of returning a function
  // that has this correctly bound and the .route method available.
  var test = this.test.bind(this);
  test.route = this.route.bind(this);

  this.log = function (flag, response, args) {
    if (typeof test.log === 'function') {
      test.log(flag, response, args);
    }
  };

  return test;
}

Features.prototype.route = function (flag, returns) {
  if (returns === undefined) {
    returns = 'route';
  }

  return function (req, res, next) {
    next(!this.test(flag, req) && returns);
  }.bind(this);
};

Features.prototype.test = function (flag) {
  var response = gateway.apply(this, arguments); // jshint ignore:line
  this.log(flag, response, [].slice.call(arguments, 1));

  return response;
};

if (typeof exports !== 'undefined') {
  module.exports = Features;
}
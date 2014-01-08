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
  this.flags = flags;
  this.log = null;

  return this;
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

  if (typeof this.log === 'function') {
    this.log(flag, response);
  }

  return response;
};

module.exports = Features;
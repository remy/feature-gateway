# Feature Gateway

Simple, memory and JS based feature testing with [express](http://expressjs.com) support.

## Usage

Simple usage:

### flags.js

```js
module.exports = {
  'beta': function (user) {
    return user.beta;
  },
  '10%': function (user) {
    return user.id % 10 === 0;
  }
}
```

### app.js

```js
'use strict';

var flags = require('./flags');
var features = require('./lib')(flags);

var user = { beta: true }; // usually from a database


if (features('beta', user)) {
  // show beta features
}

```

## Usage with express routes

The feature gateway can be used with express to block or grant access to
particular routes:

### flags.js

```js
module.exports = {
  'beta': function (req) { // also recieves res & next
    return req.session.user.beta; // content set from some other middleware
  },
  '10%': function (req) {
    return req.session.user.id % 10 === 0;
  }
}
```

### routes.js

```js
app.get('/home', features.route('beta'), function (req, res) {
  // send the redesigned beta homepage
  res.render('home-v2');
});

app.get('/home', function (req, res) {
  // send the regular homepage
  res.render('home');
});
```

## Logging

You can attach a logger, and you'll get the data about the feature test:

```js

var features = new Features(flags);

features.log = function (flag, response, args) {
  console.log('Flag: ' + flag);
  console.log('Response: ' + response);
  console.log('Arguments to flag test: ' + JSON.stringify(args));
}
```

## Inverting

If you want the inverse of the flag, prefix the feature with a `!` to invert the result:

```js
if (features('!beta', user)) {
  // this is for users who are NOT in the beta flag
}
```

## Examples

### Templating

This is an example of how we're using the features in our handlebar templates (as well as routes and general code):

```js
'use strict';
var hbs = require('hbs'),
    features = require('./features');

/**
 * usage:
 *
 * {{feature user "alpha"}}<!-- here be the new stuff -->{{/feature}}
 */

hbs.registerHelper('feature', function(user, flag, options) {
  // note that for this project, the convention is that the feature receives a request object
  // that will contain a session property with the user, so I'm fleshing it out here.
  if (features(flag, { session: { user: user } })) {
    return options.fn(this);
  }
});

module.exports = hbs;
```

### AB testing

The following is an example of how to use the feature gateway to give 50% of users (based on IP address) a feature:

```js
function ipAsNum(req) {
  // takes the last part of an IP (n.n.n.last-part) and returns as number
  return (req.headers['x-real-ip'] || req.ip || '0.0').split('.').slice(-1) * 1;
}

function percentage(n, req) {
  var ip = ipAsNum(req);
  return (ip / 256) <= (n / 100);
}

var features = new Features({
  fooFeature: function (request) {
    // request is the express request object - passed in via our routing OR handlebars feature flags

    // note that now 50% can easily be tweaked to 10% or even 100%
    return percentage(50, request);
  }
});
```

Now my code can use `fooFeature` test and 50% of visitors will get the feature to allow me to perform real A/B testing.

## License

MIT / [http://rem.mit-license.org](http://rem.mit-license.org)


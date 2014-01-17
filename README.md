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

## Examples

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

## License

MIT / [http://rem.mit-license.org](http://rem.mit-license.org)


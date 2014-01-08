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

## License

MIT / [http://rem.mit-license.org](http://rem.mit-license.org)
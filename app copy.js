// cd documents/node3/oct31tonov1/sunmarch26bothvalidgood

/*
https://support.apple.com/en-us/ht201361

const json = JSON.stringify(before);
const after = JSON.parse(json);

HTTP status codes/http methods
200 (OK)            > A successful GET or PUT request
201 (CREATED)       > A successful POST request
204 (NO CONTENT)    > A successful DELETE request
304 (NO CONTENT)    > A successful DELETE request
// something about the request was bad, the client made a mistake and it’s not the server’s fault
400 (BAD REQUEST)   > An unsuccessful GET, POST, or PUT request, due to invalid content
401 (UNAUTHORIZED)  > Requesting a restricted URL with incorrect credentials
403 ()              > 
404 (NOT FOUND)     > Unsuccessful request due to an incorrect parameter in the URL
500 (SERVER ERROR)  > Request method not allowed for the given URL

200- OK; Standard response for successful HTTP requests
201- Created; Request has been fulfilled. New resource created
204- No Content; Request processed. No content returned
301- Moved Permanently; This and all future requests directed to the given URI
304- Not Modified; Resource has not been modified since last requested
400- Bad Request; Request cannot be fulfilled due to bad syntax
401- Unauthorized; Authentication is possible, but has failed
403- Forbidden; Server refuses to respond to request
404- Not Found; Requested resource could not be found
500- Internal Server Error; Generic error message when server fails
501- Not Implemented; Server does not recognize method or lacks ability to fulfill
503- Service Unavailable; Server is currently unavailable

www.w3.org/Protocols/rfc2616/rfc2616-sec10.html

show dbs
use pec2016s
show collections
db.users.find().pretty()
use pec2016s
db.dropDatabase()
*/

require('dotenv').load();

process.env.NODE_ENV = 'development';

var express     = require('express');
var helmet      = require('helmet');
var https       = require('https');
var path      = require('path');
//var favicon = require('serve-favicon');
var cookieParser  = require("cookie-parser");
var bodyParser    = require('body-parser');
var fs        = require('fs');
var morgan      = require("morgan");
var rfs       = require('rotating-file-stream');
var passport      = require('passport');
var parseurl    = require('parseurl');
var session       = require('express-session');
var MongoStore    = require('connect-mongo')(session);
var setUpAuthentication = require('./theAPI/model/authentication');
var serverRoutes  = require('./theServer/routes/serverRoutes');
var apiRoutes     = require('./theAPI/routes/apiRoutes');
require('./theAPI/model/dbConnector');
var sanitize = require('./shared/sanitizeInput.js');
require('./shared/sessionPrototype');
var app           = express();
var logDirectory     = path.join(__dirname, 'httpRequestLog');
//app.disable('x-powered-by');


// cert: fs.readFileSync(__dirname + '/ssl/thisgreatappCRT.pem')
// Let's Encrypt: free, automated open CA, by Internet Security Research Group (ISRG)
// encourages adoption of SSL

// node does not automatically redirect from http to https
// set up a http request handler for redirection
// need a node http request handler for https redirection
// use Nginx serverin front the app to habdle SSL connection

var options = {
	key: fs.readFileSync(__dirname + '/ssl/thisgreatappPEM.pem'),
	cert: fs.readFileSync(__dirname + '/ssl/thisgreatappCRT.crt')
};

setUpAuthentication();

app.set('views', path.join(__dirname, 'theServer', 'views'));
app.set('view engine', 'pug');
//app.set('view cache', true);

//app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));

fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

var accessLogStream = rfs('access.log', {
  interval: '1d',
  path: logDirectory
});

app.use(morgan('dev'));
//app.use(morgan('combined', {stream: accessLogStream}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(helmet());
app.use(cookieParser());

var cookieExpiryDate = new Date( Date.now() + 14 * 24 * 60 * 60 );
var sessionExpireDate = 6 * 60 * 60 * 1000; // 6 hours
// var sessionExpireDate = 20 * 60 * 1000; // 20 minutes
// 31,536,000 seconds in a year
// 60 * 60 * 1000 = 3,600,000 == 1 hour
// 20 * 60 * 1000 = 1,200,000 == 20 min
// 86,400,000 (24 × 60 × 60 × 1000) milliseconds – one day
// 18,000,000 === 5 hours
// var oneHour = 3,600,000
// req.session.destroy();

// 'express-session' directly reads and writes cookies on 'req'/'res'
// To store or access session data, use the request property 'req.session'
// To get the ID of the loaded session, access the request property 'req.sessionID'. 
// This is simply a read-only value set when a session is loaded/created.
// Session data is _not_ saved in the cookie itself, just the session ID.

/*
Session ID stored in Cookie
Show user the last page they were on at login
'We found a cookie of yours!'
'The last page you were on when you logged out was...'
Check security book PDF
You regenerate session ID's (SID) to avoid session fixation
When user Log's In, app will check for cookies to see if user has an existing session
You don't need external 
*/

// Session Fixation: attackers set the target's sessionID, and once the session
// is authenticated, they use that knowledge to hijack the session.

// Possible 2-tier session system (a short TTL with high-level access) & (a longer TTL with low-level access)

/*
Session fixation and session hijacking are both attacks that have a common goal i.e. to gain access to a legitimate session of another user. 
But the attack vectors are different.
In a session fixation attack, the attacker already has access to a valid session and tries to force the victim to use this particular session. 
While in a session hijacking attack, the attacker tries to get the ID of a victim's session to use his/ her session.
*/

//https://github.com/expressjs/session/blob/master/session/session.js

if (app.get('env') === 'development') {
  app.locals.pretty = true;
}

app.use(session({
  	store: new MongoStore({
  		url: 'mongodb://localhost/pec2016s',
  		autoRemove: 'native'
  	}),
  	name: 'id',
    secret: process.env.SESSION_SECRET,
  	resave: false,
    rolling: true,
  	saveUninitialized: false,
  	cookie: {
  		secure: true,
  		httpOnly: true,
  		maxAge: sessionExpireDate
  	}
}));

app.use(passport.initialize());
app.use(passport.session());

// Below, using variable '/' to define where middleware functions are loaded ('/')
// Then, you can read the value of the parameter from the route handler

// To Set a session variable, attach it to 'req.session' object 
// req.session.name = 'foober';

/* ++++++++ GLOBAL MIDDLEWARE FUNCTION +++++++++++ */
app.use(function(req, res, next){
  console.log('####### > app.js > app.use > req(method/url): ', req.method, " :: ", req.url)

  res.locals.currentUser = req.user;
  res.locals.reqUrl = req.url;
  res.locals.currentURL = req.url;

  if(res.locals.currentUser){
    req.session.paginateFrom = res.locals.sortDocsFrom;
    req.session.lastPageVisited = '/indexView';
  }

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);

  /*
  var views = req.session.views;
  if (!views) {
    views = req.session.views = {}
  }
  var pathname = parseurl(req).pathname;
  views[pathname] = (views[pathname] || 0) + 1;
  */

  var s = /Safari/;
  var c = /Chrome/;
  if((s.test(req.headers['user-agent'])) && (!c.test(req.headers['user-agent']))){
  	res.locals.isSafari = true;
  }else{
  	res.locals.isSafari = false;
  }

  //console.log('####### > app.js > app.use2 > You have viewed ' + req.url + ' ' + req.session.views[req.url] + ' times')

  // req.session._csrf = req.csrfToken();
  // res.locals._csrfToken = req.csrfToken();
  // var voo = req.isAuthenticated();
  // res.locals.currentUserFOO = req.user;
  // console.log('####### > app.js > app.use > req.user: ', req.user)
  // console.log('####### > app.js > app.use > res.locals: ', res.locals)
  // console.log('####### > app.js > app.use > req.isAuthenticated(): ', voo)
  // console.log('####### > app.js > app.use > res.locals._csrfToken1: ', res.locals._csrfToken1)
  // console.log('####### > app.js > app.use1 > res.locals: ', res.locals)
  // req.session.cookie.expires = new Date(Date.now() + oneHour);
  next();
});

app.use('/', serverRoutes);
app.use('/api', apiRoutes);


// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


app.use(function(req, res, next) {
	console.log('####### > app.js > app.use > ERRRORR > 404')
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function (err, req, res, next) {
  console.log('####### > app.js > app.use > ERRRORR > req.headers[referer]: ', req.headers['referer'])
  console.log('####### > app.js > app.use > ERRRORR > err.name: ', err.name)
  console.log('####### > app.js > app.use > ERRRORR > err.code: ', err.code)
  console.log('####### > app.js > app.use > ERRRORR > err.message: ', err.message)
  //console.log('####### > app.js > app.use > ERRRORR > err: ', err)

  if (err.name === 'UnauthorizedError') {

    req.session.csrfError = 'A "' + err.name + '" error occurred, please submit form again.';
    res.status(err.status);
    res.json({'message' : err.name + ': ' + err.message});

  }else if (err.code === 'EBADCSRFTOKEN') {

    console.log('####### > app.js > app.use >>>>> EBADCSRFTOKEN ERROR <<<< 1: ', req.session)
    console.log('####### > app.js > app.use >>>>> EBADCSRFTOKEN ERROR <<<< 2: ', res.locals)

    req.session.csrfError = 'A1 "' + err.code + '" error occurred, please submit form again.\nIf problem persists, please contact customer service.';
    res.locals.csrfError = 'A2 "' + err.code + '" error occurred, please submit form again.\nIf problem persists, please contact customer service.';
    res.status(err.status);
    res.json({'response': 'error', 'type': 'token', 'redirect': req.headers['referer']});

  } else{

    // JSON/Javascript object type errors 
    console.log('####### > app.js > app.use > Other Error > Error! 3')
    res.status(err.status);
    res.json({'message' : err.name + ': ' + err.message});

  }
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    console.log('####### > app.js > app.use > app.get.env > ERROR development')
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces
app.use(function(err, req, res, next) {
  console.log('####### > app.js > app.use > app.get.env > ERROR production')
    res.status(err.status || 500);
    res.render('loginorsignup', {
      error: 'A "'+ err.status+ ' : HTTP Satus Code" error recently occurred, please Log In or Sign Up again.'
    });
});

module.exports = app;
app.set('port', process.env.PORT || 3000);
https.createServer(options, app).listen(app.get('port'));


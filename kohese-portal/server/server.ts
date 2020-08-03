process.title = "kohese-server";

var express = require('express');
var morgan = require('morgan');
var https = require('https');

const KohesePort = 3010;

function redirectToHTTPS(req, res, next) {
  if (req.secure) {
    return next();
  }
  console.log('!!! Redirecting to https: ' + req.url);
  res.redirect(301, 'https://' + req.hostname + ':' + KohesePort + req.url);
}

var app = module.exports = express().use(redirectToHTTPS);

global['app'] = app;

app.use(morgan('short'));

// start the server if `$ node server.js`
if (require.main === module) {

  //Paths may be provided via arguments when starting via -kdb=PATH
  var baseRepoPath = 'kohese-kdb';
  for (var i = 2; i < process.argv.length; i++) {
    var arg = process.argv[i].split('=');
    if ((arg[0] === '-kdb') && (arg[1] !== '')) {
      baseRepoPath = arg[1];
      break;
    }
  }

  // Load the KDB
  var kdb = require('./kdb');
  global['koheseKDB'] = kdb;
  kdb.initialize(baseRepoPath).then(function () {
    try {

      // Establish routes
      var routes = require('./boot/routes');
      routes(app);

      // Setup the KoheseUser relations
      // eslint-disable-next-line no-unused-vars
      var enableAuth = require('./server-enableAuth');

      // Establish HTTPS Server
      var fs = require('fs');
      var options = {
        key: fs.readFileSync('./cert/server.key'),
        cert: fs.readFileSync('./cert/server.crt')
      };


      let httpsServer = https.createServer(options, app);

      console.log('::: Starting Express Services');
      var appServer = httpsServer.listen(KohesePort, () => {
        console.log('::: Kohese Server listening at port: ' + KohesePort);
      });

      console.log('::: Starting Kohese IO');
      var kio = require('./koheseIO');
      // eslint-disable-next-line no-unused-vars
      var kioServer = kio.Server(appServer);
      // eslint-disable-next-line no-unused-vars
      var itemServer = require('./kio-itemServer');
      // eslint-disable-next-line no-unused-vars
      var fileServer = require('./kio-fileServer');

      console.log('::: KoheseIO Started');
      app.emit('koheseIO-started');


      // check to see if 'repl' was passed as an argument. If so, start the REPL service
      for (var i = 2; i < process.argv.length; i++) {
        if (process.argv[i] === 'repl') {
          // eslint-disable-next-line no-unused-vars
          var koheseREPL = require('./kohese-repl');
          break;
        }
      }
    } catch (err) {
      console.log('*** Error while initializing server: ' + err);
      console.log(err.stack)
    }
  }).catch((err) => {
    console.log('*** Error while initializing kdb: ' + err);
    console.log(err.stack)
  });
}

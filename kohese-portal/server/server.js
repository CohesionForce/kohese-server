var loopback = require('loopback');
var morgan = require('morgan');
var boot = require('loopback-boot');

var app = module.exports = loopback();
global.app = app;

app.use(morgan("short"));

app.start = function () {
    // start the web server
    return app.listen(function () {
        app.emit('started');
        console.log('Web server listening at: %s', app.get('url'));
    });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
    if (err) throw err;

    // start the server if `$ node server.js`
    if (require.main === module) {
      
      //Paths may be provided via arguments when starting via -kdb=PATH
      var baseRepoPath = "kohese-kdb";
      for (var i = 2; i < process.argv.length; i++) {
        var arg = process.argv[i].split("=");
        if((arg[0] === "-kdb") && (arg[1] !== "")) {
          baseRepoPath = arg[1];
          break;
        }
      }

        // Load the KDB
        var kdb = require('./kdb.js');
        global.koheseKDB = kdb;
        kdb.initialize(baseRepoPath).then(function () {
          // Initialize the in-memory loopback data connector
          var lbMemInitData = kdb.retrieveDataForMemoryConnector();
          var memConnector = app.dataSources.db.connector;
          memConnector.ids = lbMemInitData.ids;
          memConnector.cache = lbMemInitData.cache;
     
          // Setup the KoheseUser relations 
          var enableAuth = require('./server-enableAuth');
          enableAuth(app);
      
          console.log("::: Starting Express Services");
          var appServer = app.start();
          
          console.log("::: Starting Kohese IO");
          var kio = require('./koheseIO.js');
          var kioServer = kio.Server(appServer);
          var itemServer = require('./kio-itemServer.js');
          var fileServer = require('./kio-fileServer.js');
          
          console.log("::: KoheseIO Started");
          app.emit('koheseIO-started');

          
          // check to see if 'repl' was passed as an argument. If so, start the REPL service
          for (var i = 2; i < process.argv.length; i++) {
              if(process.argv[i] === 'repl') {
                  var koheseREPL = require('./kohese-repl.js');
                  break;
              }
          }
        });
    }
});

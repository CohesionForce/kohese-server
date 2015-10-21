// *******************************************************
// expressjs template
//
// assumes: npm install express
// defaults to jade engine, install others as needed
//
// assumes these subfolders:
//   public/
//   public/javascripts/
//   public/stylesheets/
//   views/
//
var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');

var expressLogFile = fs.createWriteStream('./express.log', {flags: 'a'});
// Configuration
//app.use(express.logger({stream: expressLogFile}));
app.use(bodyParser.text());
app.use(bodyParser.json());
//app.use(express.methodOverride());
//app.use(app.router);

function start() {
  app.post('/services/analysis', function (req, res) {
    console.log("::: Received post:");
//    console.log(req);
    console.log(req);
    console.log("::: Headers:");
    console.log(req.headers);
    console.log("::: Body:");
    console.log(req.body);
    response = {hello: "world"};
    res.send(response);
  });
  var port = process.env.PORT || 9091;
  app.listen(port);
  console.log("Express server listening on port %d in %s mode", port, app.settings.env);
}
// *******************************************************
start();
exports.start = start;
exports.app = app;

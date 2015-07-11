module.exports = function(Analysis) {

  var http = require('http');
//  var app = require('../../server/server.js');
//  var Item = app.models.Item;
   
  Analysis.performAnalysis = function(onId, cb) {

   // Item.findById(onId, function(err, item) {console.log(item)});
    
    console.log('::: ANALYZING: ' + onId);
    
    var options = {
        host: "localhost",
        port: 9091,
        path: '/services/analysis/' + onId,
        method: 'GET'
      };

    // console.log('OPTIONS: ' + JSON.stringify(options));
    
    http.request(options, function(res) {
        var response = "";
        // console.log('STATUS: ' + res.statusCode);
        // console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
           
        // console.log('::: BODY: ' /* + chunk*/);
        response += chunk.toString();
          
        });
        res.on('end', function (){
          var analysis = new Analysis;
          analysis.id = onId;
          try {
            analysis.raw = JSON.parse(response);
            analysis.save();            
          }
          catch(err) {
            console.log("*** Error parsing result for: " + onId);
            console.log("Analysis response:  >>>" + response + "<<<");
            console.log(err);
          }
          
          cb(null, analysis.raw);          
        });
      }).end();


  }

  Analysis.remoteMethod('performAnalysis', {
    accepts : {
      arg : 'onId',
      type : 'string'
    },
    returns : {
      arg : 'raw',
      type : 'object'
    }
  });

};

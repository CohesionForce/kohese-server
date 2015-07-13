module.exports = function(Analysis) {

  var http = require('http');
  
  Analysis.performAnalysis = function(onId, cb) {

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
          analysis.raw = JSON.parse(response);
          analysis.save();
          
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

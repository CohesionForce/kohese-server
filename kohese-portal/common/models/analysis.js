module.exports = function(Analysis) {

  Analysis.performAnalysis = function(onId, cb) {
    cb(null, 'Analyzing: ' + onId);
  }

  Analysis.remoteMethod('performAnalysis', {
    accepts : {
      arg : 'onId',
      type : 'string'
    },
    returns : {
      arg : 'response',
      type : 'string'
    }
  });

};

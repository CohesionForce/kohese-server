function MockKoheseIO() {
  var callbackStack = [];

  var errorResults = {error: 'error'};
  var successResults = {};

  this.resolveCallbacks = (type) => {
    for (var i=0; i < callbackStack.length;i++) {
      type === 'err' ? callbackStack[i](errorResults) : 
        callbackStack[i](successResults); 
    }
  }

  this.connect = function() {
  };
    
  this.disconnect = function() {
  };

  this.socket = {
    on : (event, callback) =>{
      callback();
    },
    emit: (event,data,callback) =>{
      callbackStack.push(callback);
    },
    id: 'Session-01',
    handshake: {address: '1.2.3.4'},
    koheseUser : {username: 'Test user'}
  }
}

module.exports = MockKoheseIO;
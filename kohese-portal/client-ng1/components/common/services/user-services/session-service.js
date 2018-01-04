/* Created by Josh. 09/25/17
	    This service keeps track of changes to the session list while the client 
	    is running. Information needed by the client in regards to session should
	    be pulled from here
	*/
function SessionService (KoheseIO) {
  var service = this;

  service.sessions = {};

  /* Listeners to provide updates to the session list as they come in from 
            the server */
  KoheseIO.socket.on('session/add', function (session) {
    service.sessions[session.sessionId] = session;
    console.log('::: Added session %s for %s at %s', session.sessionId, session.username, session.address);
  });
  /* Removes users as they disconnect */
  KoheseIO.socket.on('session/remove', function (session) {
    console.log('::: Removed session %s for %s at %s', session.sessionId, session.username, session.address);
    delete service.sessions[session.sessionId];
  });
  /* Full refresh of the session list */
  KoheseIO.socket.on('session/list', function (sessionList) {
    // Remove existing sessions
    for (var key in service.sessions) {
      console.log('... Removing session' + key);
      delete service.sessions[key];
    }

    for (var sessionIdx in sessionList) {
      var session = sessionList[sessionIdx];
      console.log('::: Existing session %s for %s at %s', session.sessionId, session.username, session.address);
      service.sessions[session.sessionId] = session;
    }
  });
  /* End Register Sessions */
}

export default () => {
  angular.module('app.services.sessionservice', ['app.factories.koheseio'])
    .service('SessionService', SessionService);
}
    
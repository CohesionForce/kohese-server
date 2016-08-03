module.exports = function enableAuthentication(server) {
  // enable authentication
  server.enableAuth();
  
  server.once('started', function(baseUrl) {
	var KoheseUser = server.models.KoheseUser;
    KoheseUser.checkAndCreateUsersItem(server);
  });

};

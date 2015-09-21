module.exports = function enableAuthentication(server) {
  // enable authentication
  server.enableAuth();
  
  server.once('started', function(baseUrl) {
    var KoheseUser = server.models.KoheseUser;
    
    KoheseUser.find({where: {
        name: 'admin'
      }
    }, function(err, principal) {
      if(principal.length === 0){
        console.log("::: Creating admin account");
        var now = Date.now();
        KoheseUser.create({
           name: 'admin',
           description: 'Administrator',
           password: 'kohese',
           createdBy: 'admin',
           createdOn: now,
           modifiedBy: 'admin',
           modifiedOn: now
          }, function(err, principal){
            console.log("::: Created admin account");
          });
        } else {
          console.log("::: Admin account already exists");
        };
    });
    
  });

};

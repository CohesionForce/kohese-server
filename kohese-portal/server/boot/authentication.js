module.exports = function enableAuthentication(server) {
  // enable authentication
  server.enableAuth();
  
  server.once('started', function(baseUrl) {
    var KohesePrincipal = server.models.KohesePrincipal;
    
    KohesePrincipal.find({where: {
        name: 'admin'
      }
    }, function(err, principal) {
      if(principal.length === 0){
        console.log("::: Creating admin account");
        var now = Date.now();
        KohesePrincipal.create({
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

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
        KohesePrincipal.upsert({
           name: 'admin',
           password: "kohese",
           createdBy: 'admin',
           createdOn: Date.now()
          }, function(err, principal){
            console.log("::: Created admin account");
          });
        } else {
          console.log("::: Admin account already exists");
        };
    });
    
  });

};

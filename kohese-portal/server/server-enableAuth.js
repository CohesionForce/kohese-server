module.exports = function enableAuthentication(server) {
  // enable authentication
  server.enableAuth();
  var UsersItem;
  
  function checkAndCreateUsersItem() {
    var Item = server.models.Item;
    
    Item.find({where: {
        name: 'Users'
      }
    }, function(err, principal) {
      if(principal.length === 0){
        console.log("::: Creating Users Item");
        var now = Date.now();
        Item.create({
           name: 'Users',
           description: 'User accounts',
           createdBy: 'admin',
           createdOn: now,
           modifiedBy: 'admin',
           modifiedOn: now
          }, function(err, item){
            console.log(">>> " + err);
            console.log("::: Created Users Item");
            console.log(JSON.stringify(item,null,"  "));
          });
        } else {
          console.log("::: Users Item already exists");
          console.log(JSON.stringify(principal[0],null,"  "));
        };
    });    
  }
  
  function checkAndCreateAdminAccount() {
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
  }
  
  server.once('started', function(baseUrl) {
    checkAndCreateUsersItem();
    checkAndCreateAdminAccount();
  });

};

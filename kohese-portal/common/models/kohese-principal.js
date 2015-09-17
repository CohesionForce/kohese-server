module.exports = function(KohesePrincipal) {

  KohesePrincipal.observe('after save', function (ctx, next) {
    console.log("::: Principal save")
    next();
  });
  
  KohesePrincipal.beforeRemote('upsert', function (ctx, modelInstance, next) {
    console.log("::: Principal beforeRemote")
    next();
  });
  
  KohesePrincipal.beforeRemote('upsert', KohesePrincipal.beforeUpsertKohese);
  KohesePrincipal.observe('after save', KohesePrincipal.afterSaveKohese);
  KohesePrincipal.observe('after delete', KohesePrincipal.afterDeleteKohese);

};

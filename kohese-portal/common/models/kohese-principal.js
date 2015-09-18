module.exports = function(KohesePrincipal) {

  // Remote methods are not inherited
  KohesePrincipal.beforeRemote('create', KohesePrincipal.addModificationHistory);
  KohesePrincipal.beforeRemote('upsert', KohesePrincipal.addModificationHistory);

};

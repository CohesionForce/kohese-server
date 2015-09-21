module.exports = function(KoheseUser) {

  // Remote methods are not inherited
  KoheseUser.beforeRemote('create', KoheseUser.addModificationHistory);
  KoheseUser.beforeRemote('upsert', KoheseUser.addModificationHistory);

};

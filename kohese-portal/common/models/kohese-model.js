module.exports = function(KoheseModel) {

  // Remote methods are not inherited
  KoheseModel.beforeRemote('create', KoheseModel.addModificationHistory);
  KoheseModel.beforeRemote('upsert', KoheseModel.addModificationHistory);

};

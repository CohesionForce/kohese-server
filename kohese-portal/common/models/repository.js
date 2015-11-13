module.exports = function(Repository) {

  // Remote methods are not inherited
  Repository.beforeRemote('create', Repository.addModificationHistory);
  Repository.beforeRemote('upsert', Repository.addModificationHistory);

};

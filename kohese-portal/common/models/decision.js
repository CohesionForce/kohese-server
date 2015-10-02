module.exports = function(Decision) {

  // Remote methods are not inherited
  Decision.beforeRemote('create', Decision.addModificationHistory);
  Decision.beforeRemote('upsert', Decision.addModificationHistory);

};

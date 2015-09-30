module.exports = function(Action) {

  // Remote methods are not inherited
  Action.beforeRemote('create', Action.addModificationHistory);
  Action.beforeRemote('upsert', Action.addModificationHistory);

};

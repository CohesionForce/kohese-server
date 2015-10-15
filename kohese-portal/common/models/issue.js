module.exports = function(Issue) {

  // Remote methods are not inherited
  Issue.beforeRemote('create', Issue.addModificationHistory);
  Issue.beforeRemote('upsert', Issue.addModificationHistory);

};

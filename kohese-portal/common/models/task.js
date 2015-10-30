module.exports = function(Task) {

  // Remote methods are not inherited
  Task.beforeRemote('create', Task.addModificationHistory);
  Task.beforeRemote('upsert', Task.addModificationHistory);

};

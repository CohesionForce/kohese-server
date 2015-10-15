module.exports = function(Observation) {

  // Remote methods are not inherited
  Observation.beforeRemote('create', Observation.addModificationHistory);
  Observation.beforeRemote('upsert', Observation.addModificationHistory);

};

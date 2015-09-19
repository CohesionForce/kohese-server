module.exports = function(Category) {

  // Remote methods are not inherited
  Category.beforeRemote('create', Category.addModificationHistory);
  Category.beforeRemote('upsert', Category.addModificationHistory);

};

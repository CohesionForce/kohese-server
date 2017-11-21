/**
 * Created by josh on 8/28/15.
 *
 * Webpack dependency file
 */
export default() => {
  require('./tabService')();
  require('./itemRepository')();
  require('./authenticationServices')();
  require('./analysisService')();
  require('./kind-services/decision-service')();
  require('./kind-services/action-service')();
  require('./kind-services/issue-service')();
  require('./kind-services/observation-service')();
  require('./category-services/category-service')();
  require('./user-services/user-service')();
  require('./user-services/session-service')();
  require('./navigation-services/navigation-service')();
  require('./search-service')();
  require('./versionControlService')();
  require('./kohese-io')();
  require('./importService')();
  require('./modal-service/modal-service')();
  require('./highlight-service')();
}
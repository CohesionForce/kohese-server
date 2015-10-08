/**
 * Created by josh on 8/28/15.
 *
 * Webpack dependency file
 */
export default() => {
    require('./tabService')();
    require('./lb-services')();
    require('./itemRepository')();
    require('./authenticationServices')();
    require('./analysisService')();
    require('./kind-services/decision-service')();
    require('./kind-services/action-service')();
    require('./category-services/category-service')();
    require('./user-services/user-service')();
}
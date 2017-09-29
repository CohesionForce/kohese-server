/**
 * Created by josh on 8/28/15.
 *
 * Webpack dependency file. Will register components with the bundler.
 */

export default () => {
    //Component Modules
    require('./tree/modals/modalcontrollers')();
    require('./tree/tree')();
    require('./detailsview/detailsview')();
    require('./contentcontainer/contentcontainer')();
    require('./navigationmenu/navigationmenu')();
    require('./login/login')();
    require('./search/search')();
    require('./admin/admin')();
    require('./dashboard/dashboard')();

    //Common

    require('./common/services/services.config')();
    require('./common/directives/directives.config')();
    require('./common/sb-admin-2')();

}
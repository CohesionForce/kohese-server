/**
 * Created by josh on 8/28/15.
 *
 * Webpack dependency file. Will register components with the bundler.
 */

export default () => {
    //Component Modules
    require('./tree/tree')();
    require('./detailsview/detailsview')();
    require('./contentcontainer/contentcontainer')();
    require('./navigationmenu/navigationmenu')();

    //Common

    require('./common/services/services.config')();
    require('./common/directives/directives.config')();
    require('./common/sb-admin-2')();

}
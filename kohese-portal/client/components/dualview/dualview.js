/**
 * Created by josh on 7/28/15.
 */

    angular.module('app.dualview', ['ngNewRouter'])
        .controller('DualviewController', DualviewController)

    function DualviewController($router){
        $router.config([
            {path:'/tree',       components: {top:'tree', bottom:'detailsview'}}
        ]);
    }

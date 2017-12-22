/**
 * Created by josh on 10/16/15.
 */
function ObservationService(ItemRepository, $rootScope) {
  var service = this;
}

export default () => {
  angular.module('app.services.observationservice', ['app.services.itemservice'])
    .service('ObservationService', ObservationService);
}
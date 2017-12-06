/*
    Webpack configuration file for constant definitions
*/
import { EndpointsModule } from './endpoints'


export const ConstantsModule = {
  init: function () {
    EndpointsModule.init();
  }
}

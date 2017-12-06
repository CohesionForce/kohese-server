/*
  Webpack config file for application array filters
*/
import { HighlightFilterModule } from './highlight';
import { HTMLFilterModule } from './html-filter';

export const FiltersModule = {
  init: function () {
    HighlightFilterModule.init();
    HTMLFilterModule.init();
  }
}

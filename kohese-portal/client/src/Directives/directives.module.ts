// Angular Imports
import { NgModule } from '@angular/core';

// NPM Direcives

// Custom Directives
import { ShowIfTruncatedDirective } from '../Directives/show-if-truncated.directive';

@NgModule({
  declarations : [ShowIfTruncatedDirective],
  exports : [ShowIfTruncatedDirective]
})
export class directivesModule {}

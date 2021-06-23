// Angular Imports
import { NgModule } from '@angular/core';

// NPM Direcives

// Kohese Directives
import { ShowIfTruncatedDirective } from '../directives/show-if-truncated.directive';

@NgModule({
  declarations : [ShowIfTruncatedDirective],
  exports : [ShowIfTruncatedDirective]
})
export class DirectivesModule {}

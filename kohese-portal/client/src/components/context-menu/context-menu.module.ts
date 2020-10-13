import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatIconModule, MatMenuModule, MatTooltip, MatTooltipModule } from "@angular/material";
import { ContextMenuComponent } from './context-menu.component';

@NgModule({
  declarations: [ContextMenuComponent],
  exports: [
    ContextMenuComponent
  ],
  imports: [
    MatMenuModule,
    MatTooltipModule,
    MatIconModule,
    CommonModule,
  ]
})

export class ContextMenuModule {
  constructor(){}
}

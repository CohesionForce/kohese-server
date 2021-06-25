/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import { NgModule, Component, ChangeDetectionStrategy,
  ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Routes, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';

import { AnalysisModule } from './components/analysis/analysis.module'
import { DocumentModule } from './components/document/document.module';
import { ServicesModule } from './services/services.module';
import { ItemRepository } from './services/item-repository/item-repository.service';
import { ItemProxy } from '../../common/src/item-proxy';
import { TreeConfiguration } from '../../common/src/tree-configuration';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminComponent } from './components/admin/admin.component';
import { LoginComponent } from './components/login/login.component';
import { VersionsComponent } from './components/versions/versions.component';
import { RepositoriesComponent } from './components/admin//repositories/repositories.component';
import { ExploreComponent } from './components/explore/explore.component';
import { AnalysisComponent } from './components/analysis/analysis.component';
import { TypeEditorComponent } from './components/type-editor/type-editor.component';
import { DevToolsComponent } from './components/admin/dev-tools/dev-tools.component';
import { AboutComponent } from './components/admin/about/about.component';
import { DocumentOutlineComponent } from './components/document-view/document-outline/document-outline.component';
import { ReportsComponent } from './components/reports/reports.component';

@Component({
  selector: 'document-route',
  template: `
    <document [documentConfiguration]="documentConfiguration"></document>
  `,
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentRouteComponent implements OnInit, OnDestroy {
  private _documentConfiguration: any;
  get documentConfiguration() {
    return this._documentConfiguration;
  }

  private _treeConfigurationSubscription: Subscription;

  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    private _route: ActivatedRoute, private _itemRepository: ItemRepository) {
  }

  public ngOnInit(): void {
    this._treeConfigurationSubscription = this._itemRepository.getTreeConfig().
      subscribe((treeConfigurationObject: any) => {
      if (treeConfigurationObject) {
        this._route.params.subscribe((parameters: Params) => {
          let itemProxy: ItemProxy = (parameters['id'] ? TreeConfiguration.
            getWorkingTree().getProxyFor(parameters['id']) : undefined);
          if (itemProxy) {
            if (itemProxy.kind === 'DocumentConfiguration') {
              this._documentConfiguration = itemProxy.item;
            } else {
              let components: any = {};
              let process: (proxy: ItemProxy) => void = (proxy: ItemProxy) => {
                let documentComponent: any = {
                  id: proxy.item.id,
                  attributeMap: {
                    description: proxy.item.description
                  },
                  parentId: proxy.item.parentId,
                  childIds: []
                };

                components[proxy.item.id] = documentComponent;

                for (let j: number = 0; j < proxy.children.length; j++) {
                  let child: ItemProxy = proxy.children[j];
                  process(child);
                  documentComponent.childIds.push(child.item.id);
                }
              };
              process(itemProxy);
              components[itemProxy.item.id].parentId = null;

              this._documentConfiguration = {
                name: itemProxy.item.name,
                description: 'Document Configuration for ' + itemProxy.item.
                  name,
                id: itemProxy.item.id,
                parentId: itemProxy.item.parentId,
                components: components,
                delineated: false
              };
            }
          } else {
            this._documentConfiguration = undefined;
          }

          this._changeDetectorRef.markForCheck();
        });
      }
    });
  }

  public ngOnDestroy(): void {
    this._treeConfigurationSubscription.unsubscribe();
  }
}

@NgModule({
  declarations: [DocumentRouteComponent],
  imports: [
    RouterModule.forRoot([
      { path: '', redirectTo: '/dashboard', pathMatch: 'full'},
      { path: 'admin', component: AdminComponent },
      { path: 'dashboard', component: DashboardComponent},
      { path: 'login', component: LoginComponent},
      { path: 'versions', component: VersionsComponent },
      { path: 'repositories', component: RepositoriesComponent },
      { path: 'explore', component: ExploreComponent},
      { path: 'analysis', component: AnalysisComponent },
      { path: 'typeeditor', component: TypeEditorComponent},
      { path: 'devtools', component: DevToolsComponent},
      { path: 'about', component: AboutComponent},
      { path: 'outline', component: DocumentOutlineComponent },
      { path: 'document', component: DocumentRouteComponent },
      { path: 'reports', component: ReportsComponent }
    ]),
    AnalysisModule,
    DocumentModule,
    ServicesModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

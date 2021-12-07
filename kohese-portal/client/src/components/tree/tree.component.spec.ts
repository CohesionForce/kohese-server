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


// Angular
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Kohese
import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
import { TreeService } from '../../services/tree/tree.service';
import { TreeComponent } from './tree.component';

// Mocks
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { MockItem, MockAction } from '../../../mocks/data/MockItem';

fdescribe('TreeComponent', () => {
  let component: TreeComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TreeComponent],
      imports: [
        BrowserAnimationsModule,
        MatSidenavModule,
        MatIconModule,
        MatTooltipModule,
        MatInputModule,
        MatDialogModule
      ],
      providers: [
        { provide: TreeService, useClass: TreeService }
      ]
    }).compileComponents();

    let componentFixture: ComponentFixture<TreeComponent> = TestBed.createComponent(TreeComponent);
    component = componentFixture.componentInstance;

    MockItemRepository.singleton.mockFullSync();

    component.root = TreeConfiguration.getWorkingTree().getRootProxy();
    component.getTitle = {
      action: 'Tree Component Test Action',
      name: 'Tree Test'
    },
    component.getChildren = (element: any) => {
      return (element as ItemProxy).children;
    };
    component.hasChildren = (element: any) => {
      return (component.getChildren(element).length > 0);
    };
    component.getText = (element: any) => {
      return (element as ItemProxy).item.name;
    };
    component.getIcon = (element: any) => {
      return (element as ItemProxy).model.view.item.icon;
    },
    component.isFavorite = (element: any) => {
      return (
        (element as ItemProxy).item.favorite ? (element as ItemProxy).item.favorite : false);
    };
    component.allowMultiselect = true;
    component.showSelections = true;
    component.selection = [
      TreeConfiguration.getWorkingTree().getProxyFor('KoheseModel'),
      TreeConfiguration.getWorkingTree().getProxyFor('KoheseView'),
      TreeConfiguration.getWorkingTree().getProxyFor('Item')
    ];

    componentFixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should instantiate the tree component', () => {
    expect(component).toBeTruthy();
  });

  it('should add recently viewed items to the quickSelectElements array', () => {
    let mockItem = new ItemProxy('Item', MockItem());
    component.quickSelectElements.push(mockItem);
    expect(component.quickSelectElements).toContain(mockItem);
  });

  it('should add favorited items to the favorites list and the top of the quickSelectElements', () => {
    component.update(true);
    const [firstKey] = component.elementMap.keys();

    component.addToFavorites(firstKey);

    expect(component.favorites).toContain(firstKey);
    expect(component.quickSelectElements).toContain(firstKey);

  });

  it('should remove favorited items from the favorites list but leave them in the quickSelectElements', () => {

  });

  it('should set the anchored item as root and process its children to the elementArray', () => {

  });

});

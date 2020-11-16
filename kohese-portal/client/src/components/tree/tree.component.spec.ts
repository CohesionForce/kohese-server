import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatIconModule, MatInputModule, MatSidenavModule,
  MatTooltipModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { TreeComponent } from './tree.component';

describe('TreeComponent', () => {
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
      ]
    }).compileComponents();

    let componentFixture: ComponentFixture<TreeComponent> = TestBed.
      createComponent(TreeComponent);
    component = componentFixture.componentInstance;

    MockItemRepository.singleton.mockFullSync();

    component.root = TreeConfiguration.getWorkingTree().getRootProxy();
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
    };
    component.allowMultiselect = true;
    component.showSelections = true;
    component.selection = [TreeConfiguration.getWorkingTree().getProxyFor(
      'KoheseModel'), TreeConfiguration.getWorkingTree().getProxyFor(
      'KoheseView'), TreeConfiguration.getWorkingTree().getProxyFor('Item')];

    componentFixture.detectChanges();
  });

  it('moves the selected element at a given index', () => {
    component.moveElement(2, 0, true);
    expect(component.selection).toEqual([TreeConfiguration.getWorkingTree().
      getProxyFor('Item'), TreeConfiguration.getWorkingTree().getProxyFor(
      'KoheseModel'), TreeConfiguration.getWorkingTree().getProxyFor(
      'KoheseView')]);

    component.moveElement(2, 0, false);
    expect(component.selection).toEqual([TreeConfiguration.getWorkingTree().
      getProxyFor('Item'), TreeConfiguration.getWorkingTree().getProxyFor(
      'KoheseView'), TreeConfiguration.getWorkingTree().getProxyFor(
      'KoheseModel')]);
  });
});

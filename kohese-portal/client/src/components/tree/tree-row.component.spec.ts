import { TestBed, ComponentFixture } from '@angular/core/testing';

import { MaterialModule } from '../../material.module';
import { TreeRowComponent } from './tree-row.component';
import { TreeRow } from './tree-row.class';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';

describe('Component: tree-row', () => {
  let component: TreeRowComponent;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TreeRowComponent],
      imports: [MaterialModule]
    }).compileComponents();
    
    let fixture: ComponentFixture<TreeRowComponent> = TestBed.createComponent(
      TreeRowComponent);
    component = fixture.componentInstance;
    let proxy: ItemProxy = TreeConfiguration.getWorkingTree().getRootProxy();
    let row: TreeRow = new TreeRow(proxy);
    row.depth = 3;
    component.treeRow = row;
    
    fixture.detectChanges();
  });
  
  it('calculates the correct number of pixels by which to indent', () => {
    expect(component.getIndentationStyle()['padding-left']).toEqual('45px');
  });
});
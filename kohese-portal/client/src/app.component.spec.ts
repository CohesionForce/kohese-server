import { TestBed, async } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { AppComponent } from './app.component';
import { AppFrameModule } from './components/app-frame/app-frame.module';
import { AppRoutingModule } from './app-routing.module';
import { AuthenticationService } from './services/authentication/authentication.service';
import { TreeConfiguration } from '../../common/src/tree-configuration';
import { ItemCache } from '../../common/src/item-cache';

class MockAuthenticationService {

}

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports : [ 
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [ {provide: AuthenticationService, useClass: MockAuthenticationService}]
    }).compileComponents();
    
    let itemCache: ItemCache = new ItemCache();
    TreeConfiguration.setItemCache(itemCache);
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
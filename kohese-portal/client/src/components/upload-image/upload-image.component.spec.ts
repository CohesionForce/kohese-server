import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialogRef } from '@angular/material';

import { MaterialModule } from '../../material.module';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { UploadService } from '../../services/upload/upload.service';
import { NotificationService } from '../../services/notifications/notification.service';
import { MockNotificationService } from '../../../mocks/services/MockNotificationService';
import { UploadImageComponent } from './upload-image.component';

describe('UploadImageComponent', () => {
  let component: UploadImageComponent;
  let fixture: ComponentFixture<UploadImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadImageComponent ],
      imports: [MaterialModule],
      providers: [
        { provide: ItemRepository, useClass: MockItemRepository },
        { provide: UploadService, useValue: {} },
        { provide: NotificationService, useClass: MockNotificationService },
        { provide: MatDialogRef, useValue: { close: () => {} } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { TestBed, ComponentFixture} from '@angular/core/testing';
import { DetailsComponent } from './details.component';
import { JournalComponent } from './journal/journal.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from '../../material.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ServicesModule } from '../../services/services.module';

describe('Component: Details', ()=>{
  let detailsComponent: DetailsComponent;
  let detailsFixture : ComponentFixture<DetailsComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [DetailsComponent,
                     JournalComponent],
      imports : [CommonModule,
         FormsModule, 
         MaterialModule,
         PipesModule,
         ServicesModule, 
         RouterTestingModule, 
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })

    detailsFixture = TestBed.createComponent(DetailsComponent);
    detailsComponent = detailsFixture.componentInstance;
  })

  it('instantiates the details component', ()=>{
    expect(detailsComponent).toBeTruthy(); 
  })
})
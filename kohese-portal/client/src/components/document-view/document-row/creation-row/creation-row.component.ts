import { ItemRepository } from '../../../../services/item-repository/item-repository.service';
import { Input, EventEmitter } from '@angular/core';
import { ItemProxy } from 'common/src/item-proxy';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'creation-row',
  templateUrl: './creation-row.component.html',
  styleUrls: ['./creation-row.component.scss']
})
export class CreationRowComponent implements OnInit {
  @Input()
  referenceProxy : ItemProxy;
  @Input()
  relation : string;

  name = '';
  description = '';
  itemCreated : EventEmitter<ItemProxy> = new EventEmitter<ItemProxy>();

  constructor(private itemRepository : ItemRepository) { }

  ngOnInit() {
  }

  createItem () {
    let parentId = ''
    if (this.relation === 'sibling') {
      parentId = this.referenceProxy.item.parentId
    } else if (this.relation === 'child') {
      parentId = this.referenceProxy.item.id
    }
    this.itemRepository.buildItem('Item', {
      name : this.name,
      description : this.description,
      parentId : parentId
    }).then((newItem)=> {
      if (newItem) {
        this.itemCreated.emit(newItem)
      }
    })
  }

}

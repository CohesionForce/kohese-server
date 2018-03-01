import { Component } from '@angular/core';
import { NavigatableComponent } from '../../../classes/NavigationComponent.class';

import { NavigationService } from '../../../services/navigation/navigation.service';
import { VersionControlService } from '../../../services/version-control/version-control.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'repositories',
  templateUrl: './repositories.component.html'
})

export class RepositoriesComponent extends NavigatableComponent {
  remoteNameInput: string;
  remoteUrlInput: string;
  remotes: any[] = [];
  commitMessageInput: string;
  pushRemoteNameInput: string;
  repositories : Array<any> = [];
  
  constructor(private navigationService: NavigationService,
    private versionControlService: VersionControlService,
    private itemRepository: ItemRepository) {
    super(navigationService);
    this.repositories = itemRepository.getRepositories();
    // TODO update this file to do the repo status sequence 
    // leaving it out since it is currently in flux on another branch
  }
  
  addRemote() {
    if ((this.remoteNameInput !== '') && (this.remoteUrlInput !== '')) {
      this.versionControlService.addRemote(this.itemRepository.getRootProxy().item.id,
        this.remoteNameInput, this.remoteUrlInput);
    } else {
      alert('Please specify both a remote name and URL.');
    }
  }
  
  getRemotes() {
    this.versionControlService.getRemotes(this.itemRepository.getRootProxy().item.id).subscribe((r) => {
      this.remotes = r;
    });
  }
  
  commit() {
    if (this.commitMessageInput === '') {
      this.commitMessageInput = '<No message supplied>';
    }
    
    this.versionControlService.commitItems([this.itemRepository.getRootProxy()], this.commitMessageInput);
  }
  
  push() {
    this.versionControlService.push([this.itemRepository.getRootProxy().item.id], this.pushRemoteNameInput);
  }
}
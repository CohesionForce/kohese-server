import { Component } from '@angular/core';
import { NavigatableComponent } from '../../classes/NavigationComponent.class';

import * as ItemProxy from '../../../../common/models/item-proxy';
import { NavigationService } from '../../services/navigation/navigation.service';
import { TabService } from '../../services/tab/tab.service';
import { VersionControlService } from '../../services/version-control/version-control.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'repositories',
  templateUrl: './repositories.component.html'
})

export class RepositoriesComponent extends NavigatableComponent {
  private remoteNameInput: string;
  private remoteUrlInput: string;
  private remotes: any[] = [];
  private commitMessageInput: string;
  private pushRemoteNameInput: string;
  
  constructor(private navigationService: NavigationService,
    private tabService: TabService, private versionControlService: VersionControlService) {
    super(navigationService, tabService);
  }
  
  addRemote() {
    if ((this.remoteNameInput !== '') && (this.remoteUrlInput !== '')) {
      this.versionControlService.addRemote(ItemProxy.getRootProxy().item.id,
        this.remoteNameInput, this.remoteUrlInput);
    } else {
      alert('Please specify both a remote name and URL.');
    }
  }
  
  getRemotes(): Observable<any> {
    return this.versionControlService.getRemotes(ItemProxy.getRootProxy().item.id);
  }
  
  commit() {
    if (this.commitMessageInput === '') {
      this.commitMessageInput = '<No message supplied>';
    }
    
    this.versionControlService.commitItems([ItemProxy.getRootProxy()], this.commitMessageInput);
  }
  
  push() {
    this.versionControlService.push([ItemProxy.getRootProxy().item.id], this.pushRemoteNameInput);
  }
}
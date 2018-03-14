import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigatableComponent } from '../../../classes/NavigationComponent.class';

import { NavigationService } from '../../../services/navigation/navigation.service';
import { VersionControlService } from '../../../services/version-control/version-control.service';
import { ItemRepository, RepoStates } from '../../../services/item-repository/item-repository.service';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'repositories',
  templateUrl: './repositories.component.html'
})

export class RepositoriesComponent extends NavigatableComponent implements
  OnInit, OnDestroy {
  remoteNameInput: string;
  remoteUrlInput: string;
  remotes: any[] = [];
  commitMessageInput: string;
  pushRemoteNameInput: string;
  repositories: Array<any>;
  private _repositoryStatusSubscription: Subscription;
  
  constructor(private navigationService: NavigationService,
    private versionControlService: VersionControlService,
    private itemRepository: ItemRepository) {
    super(navigationService);
    // TODO update this file to do the repo status sequence 
    // leaving it out since it is currently in flux on another branch
  }
  
  public ngOnInit(): void {
    this._repositoryStatusSubscription = this.itemRepository.
      getRepoStatusSubject().subscribe((status: any) => {
      if (RepoStates.SYNCHRONIZATION_SUCCEEDED === status.status) {
        this.repositories = this.itemRepository.getRepositories();
      }
    });
  }
  
  public ngOnDestroy(): void {
    this._repositoryStatusSubscription.unsubscribe();
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
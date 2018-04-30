import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NavigatableComponent } from '../../../classes/NavigationComponent.class';

import { NavigationService } from '../../../services/navigation/navigation.service';
import { VersionControlService } from '../../../services/version-control/version-control.service';
import { ItemRepository, RepoStates } from '../../../services/item-repository/item-repository.service';
import { SessionService } from '../../../services/user/session.service';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { ItemProxy } from '../../../../../common/src/item-proxy';

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
  rootProxy: ItemProxy;

  /* Subscriptions */
  repositoryStatusSubscription: Subscription;
  treeConfigSubscription: Subscription;

  constructor(private navigationService: NavigationService,
    private versionControlService: VersionControlService,
    private itemRepository: ItemRepository,
    private _toastrService: ToastrService,
    private _sessionService: SessionService) {
    super(navigationService);
    // TODO update this file to do the repo status sequence
    // leaving it out since it is currently in flux on another branch
  }

  public ngOnInit(): void {
    this.repositoryStatusSubscription = this.itemRepository.
      getRepoStatusSubject().subscribe((status: any) => {
        if (RepoStates.SYNCHRONIZATION_SUCCEEDED === status.status) {
          this.treeConfigSubscription =
            this.itemRepository.getTreeConfig().subscribe((newConfig) => {
              this.repositories = newConfig.config.getRepositories();
              this.rootProxy = newConfig.config.getRootProxy();
            })
        }
      });
  }

  public ngOnDestroy(): void {
    this.repositoryStatusSubscription.unsubscribe();
    if (this.treeConfigSubscription) {
      this.treeConfigSubscription.unsubscribe();
    }
  }

  addRemote() {
    if ((this.remoteNameInput !== '') && (this.remoteUrlInput !== '')) {
      this.versionControlService.addRemote(this.rootProxy.item.id,
        this.remoteNameInput, this.remoteUrlInput).subscribe((remoteName: any) => {
          if (remoteName.error) {
            this._toastrService.error('Add Remote Failed', 'Version Control');
          } else {
            this._toastrService.success('Add Remote Succeeded', 'Version Control');
          }
        });
    } else {
      alert('Please specify both a remote name and URL.');
    }
  }

  getRemotes() {
    this.versionControlService.getRemotes(this.rootProxy.item.id)
      .subscribe((remotes: any) => {
        this.remotes = remotes;
        if (remotes.error) {
          this._toastrService.error('Remote Retrieval Failed', 'Version Control');
        } else {
          this._toastrService.success('Remote Retrieval Succeeded', 'Version Control');
        }
      });
  }

  commit() {
    if (this.commitMessageInput === '') {
      this.commitMessageInput = '<No message supplied>';
    }

    this.versionControlService.commitItems([this.rootProxy], this._sessionService.getSessionUser().getValue(),
      this.commitMessageInput).subscribe((statusMap: any) => {
        if (statusMap.error) {
          this._toastrService.error('Commit Failed', 'Version Control');
        } else {
          this._toastrService.success('Commit Succeeded', 'Version Control');
        }
      });
  }

  push() {
    this.versionControlService.push([this.rootProxy.item.
      id], this.pushRemoteNameInput).subscribe((pushStatusMap: any) => {
        if (pushStatusMap.error) {
          this._toastrService.error('Push Failed', 'Version Control');
        } else {
          this._toastrService.success('Push Succeeded', 'Version Control');
        }
      });
  }
}

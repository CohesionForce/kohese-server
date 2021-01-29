import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable ,  Subscription } from 'rxjs';

import { DetailsComponent } from '../../details/details.component';
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { ItemRepository, RepoStates } from '../../../services/item-repository/item-repository.service';
import { NavigatableComponent } from '../../../classes/NavigationComponent.class';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { NotificationService } from '../../../services/notifications/notification.service';
import { SessionService } from '../../../services/user/session.service';
import { VersionControlService } from '../../../services/version-control/version-control.service';
import { RepositoryService } from '../../../services/repository/repository.service';


@Component({
  selector: 'repositories',
  templateUrl: './repositories.component.html',
  styleUrls: ['./repositories.component.scss']
})

export class RepositoriesComponent extends NavigatableComponent implements
  OnInit, OnDestroy {
  remoteNameInput: string;
  remoteUrlInput: string;
  remotes: any[] = [];
  commitMessageInput: string;
  pushRemoteNameInput: string;
  repositories: Array<any>;
  repoList: Array<any>;
  rootProxy: ItemProxy;

  @Input()
  routingStrategy: string;
  rowDef: Array<string> = ["name", "count", "description", "mounted", "nav"];

  get navigationService() {
    return this._navigationService;
  }

  /* Subscriptions */
  repositoryStatusSubscription: Subscription;
  treeConfigSubscription: Subscription;

  constructor(
    private _navigationService: NavigationService,
    private versionControlService: VersionControlService,
    private repositoryService: RepositoryService,
    private itemRepository: ItemRepository,
    private _toastrService: ToastrService,
    private _notificationService: NotificationService,
    private _sessionService: SessionService,
    private dialogueService: DialogService) {
    super(_navigationService);
    // TODO update this file to do the repo status sequence
    // leaving it out since it is currently in flux on another branch
  }

  public ngOnInit(): void {
    this.repositoryStatusSubscription = this.itemRepository.
      getRepoStatusSubject().subscribe(async (status: any) => {
        if (RepoStates.SYNCHRONIZATION_SUCCEEDED === status.state) {
          this.treeConfigSubscription =
            this.itemRepository.getTreeConfig().subscribe((newConfig) => {
              this.repositories = newConfig.config.getRepositories();
              this.rootProxy = newConfig.config.getRootProxy();
            })
          this.repoList = await this.repositoryService.getAvailableRepositories();
          for (let x: number = 0; x< this.repoList.length; x++) {
            this.repoList[x].mounted = false;
            this.repoList[x].descendantCount = 0;
            if (this.repositories.some(y => y.item.name === this.repoList[x].name)) {
              let index = this.repositories.findIndex(t => t.item.name ===this.repoList[x].name);
              this.repoList[x].mounted = true;
              this.repoList[x].descendantCount = this.repositories[index].descendantCount;
            }
          }
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
            this._notificationService.addNotifications('ERROR: Version Control - Add Remote Failed');
          } else {
            this._toastrService.success('Add Remote Succeeded', 'Version Control');
            this._notificationService.addNotifications('COMPLETED: Version Control - Add Remote Succeeded');
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
          this._notificationService.addNotifications('ERROR: Version Control - Remote Retrieval Failed');;
        } else {
          this._toastrService.success('Remote Retrieval Succeeded', 'Version Control');
          this._notificationService.addNotifications('COMPLETED: Version Control - Remote Retrieval Succeeded');
        }
      });
  }

  commit() {
    if (this.commitMessageInput === '') {
      this.commitMessageInput = '<No message supplied>';
    }

    this.versionControlService.commitItems([this.rootProxy], this.
      _sessionService.user, this.commitMessageInput).subscribe((statusMap:
      any) => {
        if (statusMap.error) {
          this._toastrService.error('Commit Failed', 'Version Control');
          this._notificationService.addNotifications('ERROR: Version Control - Commit Failed');
        } else {
          this._toastrService.success('Commit Succeeded', 'Version Control');
          this._notificationService.addNotifications('COMPLETED: Version Control - Commit Succeeded');
        }
      });
  }

  push() {
    this.versionControlService.push(
      [this.rootProxy.item.id], this.pushRemoteNameInput).subscribe(
        (pushStatusMap: any) => {
        if (pushStatusMap.error) {
          this._toastrService.error('Push Failed', 'Version Control');
          this._notificationService.addNotifications('ERROR: Version Control - Push Failed');
        } else {
          this._toastrService.success('Push Succeeded', 'Version Control');
          this._notificationService.addNotifications('COMPLETED: Version Control - Push Succeeded');
        }
      });
  }

  public displayInformation(itemProxy: ItemProxy): void {
    this.dialogueService.openComponentDialog(DetailsComponent, {
      data: { itemProxy: itemProxy }
    }).updateSize('90%', '90%');
  }

}

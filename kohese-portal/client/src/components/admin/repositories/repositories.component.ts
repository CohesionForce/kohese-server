/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// Angular
import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

// Other External Dependencies
import { ToastrService } from 'ngx-toastr';

// Kohese
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
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { TreeComponent } from '../../tree/tree.component';

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
  remoteRowDef: Array<string> = ['remote'];
  rowDef: Array<string> = ['name', 'count', 'description', 'nav'];

  get navigationService() {
    return this._navigationService;
  }

  /* Subscriptions */
  repositoryStatusSubscription: Subscription;
  treeConfigSubscription: Subscription;
  repoChangeSubscription: Subscription;

  constructor(
    private _navigationService: NavigationService,
    private versionControlService: VersionControlService,
    private repositoryService: RepositoryService,
    private itemRepository: ItemRepository,
    private _toastrService: ToastrService,
    private _notificationService: NotificationService,
    private _sessionService: SessionService,
    private dialogueService: DialogService,
    private dialog: MatDialog,
    private _changeDetectorRef: ChangeDetectorRef,
    private title : Title
  ) {
    super(_navigationService);
    this.title.setTitle('Repositories');
    // TODO update this file to do the repo status sequence
    // leaving it out since it is currently in flux on another branch
  }

  public ngOnInit(): void {
    this.repositoryStatusSubscription = this.itemRepository.
      getRepoStatusSubject().subscribe((status: any) => {
        if (RepoStates.SYNCHRONIZATION_SUCCEEDED === status.state) {
          let treeConfig = this.itemRepository.getTreeConfig();
          this.treeConfigSubscription =
            treeConfig.subscribe((newConfig) => {
              this.rootProxy = newConfig.config.getRootProxy();
              this.repositories = newConfig.config.getRepositories();
              // Replace the repo change subscription
              if (this.repoChangeSubscription) {
                this.repoChangeSubscription.unsubscribe();
              }
              this.repoChangeSubscription = newConfig.config.repoChangeSubject.subscribe((repoChange) => {
                this.repositories = newConfig.config.getRepositories();
                this._changeDetectorRef.markForCheck();
              });
            });
        }
      });
  }

  public ngOnDestroy(): void {
    this.repositoryStatusSubscription.unsubscribe();
    if (this.treeConfigSubscription) {
      this.treeConfigSubscription.unsubscribe();
    }
    if (this.repoChangeSubscription) {
      this.repoChangeSubscription.unsubscribe();
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
    if (!this._sessionService.user.email) {
      this.dialogueService.openInformationDialog('Commit Not Allowed: Email Required For :', this._sessionService.user.username);
    } else {
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

  public displayInformation(id: string): void {
    let index = this.repositories.findIndex(t => t.item.id === id);
    this.dialogueService.openComponentDialog(DetailsComponent, {
      data: { itemProxy: this.repositories[index] }
    }).updateSize('90%', '90%');
  }

  public displayRepositories(): void {
    // Provides additional dialog configuration options
    const dialogConfig = new MatDialogConfig();

    let dialogRef = this.dialog.open(RepositoryContentDialog, {}).updateSize('80%');

    // Used to Pass Data back from the RepositoryContentComponent dialog
    // Typically used with the data: {} handler.
    dialogRef.afterClosed().subscribe(result => {
    })
  }

  async refreshRepositories() {
    let request = await this.repositoryService.refreshRepositories();
    console.log('*** refreshRepositories response: ', request);
    if (request === true) {
      this._toastrService.success('Repositories Status Refreshed', 'Repository Refresh',  {positionClass: 'toast-bottom-right'});
      this._notificationService.addNotifications('COMPLETED: Repositories Refresh - Completed');
    } else {
      this._toastrService.error('Repositories Status Refresh Failed ', 'Repository Refresh',  {positionClass: 'toast-bottom-right'});
      this._notificationService.addNotifications('FAILED: Repositories Refresh - Failed');
    }
  }

  public unmountRepo(id: string) {
    this.repositoryService.unMountRepository(id);
  }

  public disableRepo(id: string) {
    this.repositoryService.disableRepository(id);
  }

  public changeMountPoint(id: string) {
    let proxy = ItemProxy.getWorkingTree().getProxyFor(id);
    this.dialogueService.openComponentDialog(TreeComponent, {
      data: {
        root: TreeConfiguration.getWorkingTree().getRootProxy(),
        getTitle: {
          action: 'Change the Repository Mount Point',
          name: ''
        },
        getChildren: (element: any) => {
          return (element as ItemProxy).children;
        },
        getParent: (element: any) => {
          return (element as ItemProxy).parentProxy;
        },
        getText: (element: any) => {
          return (element as ItemProxy).item.name;
        },
        maySelect: (element: any) => {
          let itemProxy: ItemProxy = (element as ItemProxy);
          let isAncestor: boolean = itemProxy.hasAncestor(proxy);
          return (!isAncestor);
        },
        getIcon: (element: any) => {
          return (element as ItemProxy).model.view.item.icon;
        },
        isFavorite: (element: any) => {
          return (
            (element as ItemProxy).item.favorite ? (element as ItemProxy).item.favorite : false);
        },
        selection: ([proxy.parentProxy])
      }
    }).updateSize('90%', '90%').afterClosed().subscribe((result:
      Array<any>) => {
        if (result) {
          let newParentId = result[0].item.id;
          if ((proxy) && (proxy.item.parentId != newParentId)) {
            proxy.item.parentId = newParentId;
            this.itemRepository.upsertItem(proxy.kind, proxy.item);
          }
        }
    })
  }
}


/**Component Used to Display Only the Repositories Section
 * of the repositories page. This component uses the same
 * scss file, but references a different templateURL.
 * Unused constructions left for future implementation if desired.
 */
@Component({
  selector: 'repository-content-dialog',
  templateUrl: 'repository-content-dialog.html',
  styleUrls: ['./repositories.component.scss']
})
export class RepositoryContentDialog implements OnInit, OnDestroy {
  repositories: Array<any>;
  availablerepoList: Array<any>;
  repoList: Array<any> = [];
  rootProxy: ItemProxy;
  isLoaded: boolean = false;
  disabledRepos: Array<any>;
  parentId = '';

  @Input()
  routingStrategy: string;
  rowDef: Array<string> = ['name', 'duplicated', 'description', 'options'];

  get navigationService() {
    return this._navigationService;
  }

  /* Subscriptions */
  repositoryStatusSubscription: Subscription;
  treeConfigSubscription: Subscription;
  repoChangeSubscription: Subscription;

  constructor(
    private _navigationService: NavigationService,
    private versionControlService: VersionControlService,
    private repositoryService: RepositoryService,
    private itemRepository: ItemRepository,
    private _toastrService: ToastrService,
    private _notificationService: NotificationService,
    private _sessionService: SessionService,
    private dialogueService: DialogService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<RepositoryContentDialog>,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  public ngOnInit(): void {
    this.repositoryStatusSubscription = this.itemRepository.
      getRepoStatusSubject().subscribe(async (status: any) => {
        if (RepoStates.SYNCHRONIZATION_SUCCEEDED === status.state) {
          this.treeConfigSubscription =
            this.itemRepository.getTreeConfig().subscribe((newConfig) => {
              this.rootProxy = newConfig.config.getRootProxy();
              this.repositories = newConfig.config.getRepositories();
              if (this.repoChangeSubscription) {
                this.repoChangeSubscription.unsubscribe();
              }
              this.repoChangeSubscription = newConfig.config.repoChangeSubject.subscribe(async (repoChange) => {
                this.repositories = newConfig.config.getRepositories();
                this.availablerepoList = await this.repositoryService.getAvailableRepositories();
                this.repoList = [];
                this.repoList = await this.setData()
                this._changeDetectorRef.markForCheck();
              });
            })
          this.availablerepoList = await this.repositoryService.getAvailableRepositories();
          this.repoList = [];
          this.repoList = await this.setData();
          this.isLoaded = true;
        }
      });
  }

  async setData() {
    let index: number = 0;
    for (let idx: number = 0; idx < this.availablerepoList.length; idx++) {
      if (this.repositories.some(y => y.item.id === this.availablerepoList[idx].id)) {
        if (this.repositories.some(y => y.item.name === this.availablerepoList[idx].name)) {
          // This one is mounted and not a duplicate
        } else {
          this.repoList[index] = this.availablerepoList[idx];
          this.repoList[index].descendantCount = 0;
          this.repoList[index].duplicated = true;
          this.repoList[index].mounted = false;
          index++
        }
      } else {
        this.repoList[index] = this.availablerepoList[idx];
        this.repoList[index].mounted = false;
        this.repoList[index].descendantCount = 0;
        this.repoList[index].duplicated = false;
        index++;
      }
    }
    this.disabledRepos = await this.repositoryService.getDisabledRepositories();
    for (var idx: number = 0; idx < this.repoList.length; idx++) {
      if (this.disabledRepos.some(y => y.id === this.repoList[idx].id)) {
        this.repoList[idx].disabled = true;
      }
    }
    return this.repoList;
  }

  public ngOnDestroy(): void {
    this.repositoryStatusSubscription.unsubscribe();
    if (this.treeConfigSubscription) {
      this.treeConfigSubscription.unsubscribe();
    }
  }

  public displayInformation(id: string): void {
    let index = this.repositories.findIndex(t => t.item.id === id);
    this.dialogueService.openComponentDialog(DetailsComponent, {
      data: { itemProxy: this.repositories[index] }
    }).updateSize('90%', '90%');
  }

  async mountRepo(id: string, pickParent: boolean) {
    this.disabledRepos = await this.repositoryService.getDisabledRepositories();
    for (var idx: number = 0; idx < this.disabledRepos.length; idx++) {
      if (this.disabledRepos[idx].id === id) {
        var repoDisabled = true;
        break;
      }
    }

    if (!pickParent) {
      var parentIndex = this.repoList.findIndex(y => y.id === this.disabledRepos[idx].parentId)
      if (parentIndex > -1) {
        let response: boolean = await this.dialogueService.openYesNoDialog('Parent Not Mounted', 'Parent Repo ' +
          this.repoList[parentIndex].name + ' is not Mounted. ' + 'Do You Want To Pick A New Mount Point? ' +
          'If not, ' + this.disabledRepos[idx].name + ' will go to Lost and Found ');
        if (response) {
          pickParent = true;
        }
      }
    }
    if (!pickParent) {
        console.log('::: Mounting a disabled Repository')
        this.repositoryService.enableRepository(id);
        this.repositoryService.mountRepository(this.disabledRepos[idx] as ItemProxy);
    } else {
        // this.field.openObjectSelector;
        console.log('::: Mounting Unmounted Repository')
        this.dialogueService.openComponentDialog(TreeComponent, {
          data: {
            root: TreeConfiguration.getWorkingTree().getRootProxy(),
            getTitle: {
              action: 'Choose Repository Mount Point',
              name: ''
            },
            getChildren: (element: any) => {
              return (element as ItemProxy).children;
            },
            getText: (element: any) => {
              return (element as ItemProxy).item.name;
            },
            getIcon: (element: any) => {
              return (element as ItemProxy).model.view.item.icon;
            },
            isFavorite: (element: any) => {
              return (
                (element as ItemProxy).item.favorite ? (element as ItemProxy).item.favorite : false);
            },
            selection: ([])
          }
        }).updateSize('90%', '90%').afterClosed().subscribe((result:
          Array<any>) => {
            if (result) {
              let parentId = result[0].item.id;
              let timestamp: number = Date.now();
              let username: string = this._sessionService.user.name;
              this.repositoryService.addRepository(id, parentId, timestamp, username);
              var index = this.availablerepoList.findIndex(y => y.id === id)
              this.repositoryService.mountRepository(this.availablerepoList[index] as ItemProxy);
            }
        });
    }
  }
}

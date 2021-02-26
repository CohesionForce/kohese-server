import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';

import { DetailsComponent } from '../../details/details.component';
import { DialogService } from '../../../services/dialog/dialog.service';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
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
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_navigationService);
    // TODO update this file to do the repo status sequence
    // leaving it out since it is currently in flux on another branch
  }

  public ngOnInit(): void {
    this.repositoryStatusSubscription = this.itemRepository.
      getRepoStatusSubject().subscribe(async (status: any) => {
        if (RepoStates.SYNCHRONIZATION_SUCCEEDED === status.state) {
          let treeConfig = this.itemRepository.getTreeConfig();
          this.treeConfigSubscription =
            treeConfig.subscribe((newConfig) => {
              this.rootProxy = newConfig.config.getRootProxy();

              // TODO: remove once change subject is working remove this
              this.repositories = newConfig.config.getRepositories();
              // Replace the repo change subscription
              if (this.repoChangeSubscription) {
                this.repoChangeSubscription.unsubscribe();
              }
              this.repoChangeSubscription = newConfig.config.repoChangeSubject.subscribe((repoChange) => {
                console.log('::: Repo Change Occurred :', repoChange)
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

  public displayInformation(id: string): void {
    let index = this.repositories.findIndex(t => t.item.id === id);
    this.dialogueService.openComponentDialog(DetailsComponent, {
      data: { itemProxy: this.repositories[index] }
    }).updateSize('90%', '90%');
  }

  public displayRepositories(): void {
    // Provides additional dialog configuration options
    const dialogConfig = new MatDialogConfig();

    let dialogRef = this.dialog.open(RepositoryContentDialog, {}).updateSize('90%', '50%');

    // Used to Pass Data back from the RepositoryContentComponent dialog
    // Typically used with the data: {} handler.
    dialogRef.afterClosed().subscribe(result => {
    })
  }

  public unmountRepo(id: string) {
    this.repositoryService.unMountRepository(id);
    let index = this.repositories.findIndex(t => t.item.id === id);
    this.itemRepository.deleteItem((this.repositories[index] as ItemProxy), (false))
  }

  public disableRepo(id: string) {
    this.repositoryService.disableRepository(id);
    let index = this.repositories.findIndex(t => t.item.id === id);
    this.itemRepository.deleteItem((this.repositories[index] as ItemProxy), (false));
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

  @Input()
  routingStrategy: string;
  rowDef: Array<string> = ['name', 'description', 'options'];

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
              this.repositories = newConfig.config.getRepositories();
              this.rootProxy = newConfig.config.getRootProxy();
            })
          this.availablerepoList = await this.repositoryService.getAvailableRepositories();
          let index:number = 0;
          for (let x: number = 0; x < this.availablerepoList.length; x++) {
            if (!(this.repositories.some(y => y.item.name === this.availablerepoList[x].name))) {
              this.repoList[index] = this.availablerepoList[x];
              this.repoList[index].mounted = false;
              this.repoList[index].descendantCount = 0;
              index++
            }
          }
          this.isLoaded = true;
        }
      });
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

  close() {
    this.dialogRef.close();
  }

  public mountRepo(id: string): void {
    console.log('mount selected ')
    this._changeDetectorRef.markForCheck();
  }

  public enableRepo(id: string): void {
    console.log('enable selected')
    this._changeDetectorRef.markForCheck();
  }
}

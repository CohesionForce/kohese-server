// Angular
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';

// NPM
import { Observable, Subscription } from 'rxjs';

// Kohese
import { ProjectInfo } from '../../../../services/project-service/project.service';
import { ItemProxy} from '../../../../../../common/src/item-proxy';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { DetailsComponent } from '../../../details/details.component';

@Component({
  selector: 'project-overview',
  templateUrl: './project-overview.component.html',
  styleUrls: ['./project-overview.component.scss']
})
export class ProjectOverviewComponent implements OnInit, OnDestroy {
  @Input()
  projectStream: Observable<ProjectInfo>;
  projectStreamSub: Subscription;

  projectItems: Array<ItemProxy>;
  lostProjectItems : Array<ItemProxy>;
  activityList: Array<ItemProxy> = [];

  constructor(
    private dialogService: DialogService,
    private title : Title
    ) {}

  ngOnInit() {
    this.projectStreamSub = this.projectStream.subscribe((newProject: ProjectInfo) => {
      if (newProject) {
        let projectTitle: string = newProject.proxy.item.name;
        this.title.setTitle('Project Overview | ' + projectTitle);
        this.lostProjectItems = [];

        this.projectItems = newProject.projectItems;
        if (newProject.lostProjectItems) {
          this.lostProjectItems = newProject.lostProjectItems;
        }

        this.activityList = [];
        for (let proxy of this.projectItems) {
          let newItems = proxy.getDescendants();
          this.activityList = this.activityList.concat(proxy.getDescendants())
        }
        // Strip non-unique values
        this.activityList = Array.from(new Set(this.activityList));
      }
    })
  }

  ngOnDestroy() {
    this.projectStreamSub.unsubscribe();
  }

  openProxyDetails(proxy: ItemProxy) {
    this.dialogService.openComponentDialog(DetailsComponent, {
      data : {
        itemProxy : proxy
      }
    }).updateSize('80%', '80%')
      .afterClosed().subscribe((results)=>{

      });
  }

}

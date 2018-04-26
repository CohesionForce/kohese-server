import { Injectable } from "@angular/core";
import * as ItemProxy from '../../../../common/src/item-proxy';
import { ItemRepository } from "../item-repository/item-repository.service";
import { Subscription } from "rxjs";

export interface ProjectInfo {
  proxy: ItemProxy,
  users: Array<any>
  lostProjectItems?: Array<ItemProxy>
}

@Injectable()
export class ProjectService {
  projects: Array<ProjectInfo>;
  workingProjects: Array<ProjectInfo>;

  workingConfig: any;
  currentConfig: any;

  workingConfigLoaded: boolean;

  treeConfigSubscription: Subscription;
  proxyChangeSubscription: Subscription;


  constructor(private itemRepository: ItemRepository) {
    this.initService();
  }

  initService() {
    this.treeConfigSubscription =
      this.itemRepository.getTreeConfig().subscribe((newConfig) => {
        if (newConfig) {

          this.currentConfig = newConfig.config;

          if (!this.workingConfigLoaded) {
            this.workingConfig = ItemProxy.TreeConfiguration.getWorkingTree();
            this.workingProjects = this.generateProjectInfo(this.workingConfig.getAllItemProxies())
          }

          let currentTree = this.currentConfig.getAllItemProxies();
          let rootProxy = this.currentConfig.getRootProxy();
          let changeSubject = this.currentConfig.getChangeSubject();

          // Change Notification
          if (this.proxyChangeSubscription) {
            this.proxyChangeSubscription.unsubscribe();
          }

          this.proxyChangeSubscription = changeSubject.subscribe((notification) => {
            if (notification) {
              // TODO Update the Project info in the generated list
            }
          })

          // Generate Project Info 
          this.projects = this.generateProjectInfo(currentTree);
        }
      })
  }

  getProjects(): Array<ProjectInfo> {
    return this.projects;
  }

  getCurrentProjects(): Array<ProjectInfo> {
    return this.workingProjects;
  }

  isHistorical() {
    return this.workingConfig !== this.currentConfig;
  }

  generateWorkingProjects(): Array<ProjectInfo> {
    // Loop over each project item in current projects
    let projectList = [];
    for (let projectIdx in this.workingProjects) {
      let userMap = {};
      let users = [];
      let lostProjectItems = [];
      let currentProject = this.workingProjects[projectIdx];
      let projectItems = currentProject.proxy.item.projectItems;
      for (let projectItemIdx in projectItems) {
        let currentProjectItem: ItemProxy = 
          this.currentConfig.getProxyFor(projectItems[projectItemIdx].id)
        if (!currentProjectItem) {
          currentProjectItem =
             this.workingConfig.getProxyFor(projectItems[projectItemIdx].id)
          lostProjectItems.push(currentProjectItem);
          continue;
        }

        let projectItemSubTree: Array<ItemProxy> = currentProjectItem.getSubtreeAsList();

        projectItemSubTree = projectItemSubTree.filter((item) => {
          // TODO Update when assignments are pulled out into the higher proxy
          let proxyRelations = item.proxy.getRelationsByAttribute();

          return proxyRelations.references && proxyRelations.references.assignedTo;
        })

        for (let itemIdx in projectItemSubTree) {
          let proxy = this.currentConfig.getProxyFor(projectItemSubTree[itemIdx].proxy.item.id);
          let assignedProxy = proxy.relations.references[proxy.kind].assignedTo;
          if (assignedProxy && !userMap[assignedProxy.item.name]) {
            userMap[assignedProxy.item.name] = assignedProxy;
          }
        }
      }

      for (let user in userMap) {
        users.push(userMap[user]);
      }

      projectList.push({
        users: users,
        proxy: currentProject.proxy,
        lostProjectItems: lostProjectItems
      })
    }
    return projectList;
  }

  generateProjectInfo(treeList: Array<any>): Array<ProjectInfo> {
    treeList = treeList.filter((item) => {
      return item.kind === 'Project'
    })
    let projectList = []

    for (let projectIdx in treeList) {
      // Find users with assignments in project
      let userMap = {};
      let users = [];
      let currentProject = treeList[projectIdx];
      // Get referenced project items 
      let projectItems = currentProject.relations.references.Project.projectItems;
      for (let projectItemIdx in projectItems) {
        let currentProjectItem: ItemProxy = projectItems[projectItemIdx];
        let projectItemSubTree: Array<ItemProxy> = currentProjectItem.getSubtreeAsList();
        projectItemSubTree = projectItemSubTree.filter((item) => {
          // TODO Update when assignments are pulled out into the higher proxy
          let proxyRelations = item.proxy.getRelationsByAttribute();

          return proxyRelations.references && proxyRelations.references.assignedTo;

        })
        for (let itemIdx in projectItemSubTree) {
          let proxy = projectItemSubTree[itemIdx].proxy;
          let assignedProxy = proxy.relations.references[proxy.kind].assignedTo;
          if (assignedProxy && !userMap[assignedProxy.item.name]) {
            userMap[assignedProxy.item.name] = assignedProxy;
          }
        }
      }

      for (let user in userMap) {
        users.push(userMap[user]);
      }

      projectList.push({
        users: users,
        proxy: currentProject
      })
    }
    return projectList;
  }
}
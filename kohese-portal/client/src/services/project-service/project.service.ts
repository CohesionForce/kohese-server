import { Injectable } from "@angular/core";
import * as ItemProxy from '../../../../common/src/item-proxy';
import { ItemRepository } from "../item-repository/item-repository.service";
import { Subscription } from "rxjs";

export interface ProjectInfo {
  proxy: ItemProxy,
  users: Array<any>
}

@Injectable()
export class ProjectService {
  projects: Array<ProjectInfo>;

  treeConfigSubscription: Subscription;
  proxyChangeSubscription: Subscription;

  constructor(private itemRepository: ItemRepository) {
    this.initService();
  }

  initService() {
    this.treeConfigSubscription =
      this.itemRepository.getTreeConfig().subscribe((newConfig) => {
        if (newConfig) {
          let workingTree = newConfig.getAllItemProxies();
          let rootProxy = newConfig.getRootProxy();
          let changeSubject = newConfig.getChangeSubject();
          console.log(workingTree);

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
          this.projects = this.generateProjectInfo(workingTree);
      }
      })
  }

  getProjects () : Array<ProjectInfo> {
    return this.projects;
  }

  generateProjectInfo(treeList : Array<any>): Array<ProjectInfo> {
    treeList = treeList.filter((item)=>{
      return item.kind === 'Project'
    })
    let projectList = []

    for (let projectIdx in treeList) {
      // Find users with assignments in project
      let userMap = {};
      let userList = [];
      let currentProject = treeList[projectIdx];
      // Get referenced project items 
      let projectItems = currentProject.relations.references.Project.projectItems;
      for (let projectItemIdx in projectItems) {
        let currentProjectItem : ItemProxy = projectItems[projectItemIdx];
        let projectItemSubTree  : Array<ItemProxy> = currentProjectItem.getSubtreeAsList();
        projectItemSubTree = projectItemSubTree.filter((item)=>{
          // TODO Update when assignments are pulled out into the higher proxy
          let proxyRelations = item.proxy.getRelationsByAttribute();

          return proxyRelations.references && proxyRelations.references.assignedTo;

          // return (item.proxy.model.item) 
          // && (item.proxy.model.item.classProperties.assignedTo) 
          // && (item.proxy.relations.references[item.proxy.kind].assignedTo)
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
      userList.push(userMap[user]);
    }

    projectList.push({
      userList : userList,
      project : currentProject
    })
  }
    return projectList;
  }
}
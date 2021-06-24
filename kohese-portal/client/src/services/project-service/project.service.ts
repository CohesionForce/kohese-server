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


import { Injectable } from "@angular/core";
import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
import { ItemRepository } from "../item-repository/item-repository.service";
import { Subscription, Subject } from "rxjs";

export interface ProjectInfo {
  proxy: ItemProxy,
  users: Array<any>
  projectItems : Array<ItemProxy>,
  lostProjectItems?: Array<ItemProxy>
}

@Injectable()
export class ProjectService {
  projects: Array<ProjectInfo>;
  workingProjects: Array<ProjectInfo>;
  savedProject: ProjectInfo;

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
            this.workingConfig = TreeConfiguration.getWorkingTree();
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
            if (notification.proxy) {
              // TODO Update the Project info in the generated list
              if (notification.proxy.kind === 'Project') {
                this.projects = this.generateProjectInfo(this.currentConfig.getAllItemProxies());
              }
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

  // Used to remember the project currently selected within project dashboard
  getProjectById(itemID: any): ProjectInfo {
    let project: ProjectInfo = undefined;
    for(let idx = 0; idx < this.projects.length; idx++) {
      let projectInfo = this.projects[idx];
      if(projectInfo.proxy.item.id === itemID) {
        project = projectInfo;
      }
    }
    return project;
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
      let foundProjectItems = [];
      let currentProject = this.workingProjects[projectIdx];
      let projectItems = currentProject.proxy.item.projectItems;
      for (let projectItemIdx in projectItems) {
        let currentProjectItem: ItemProxy =
          this.currentConfig.getProxyFor(projectItems[projectItemIdx].id)
        if (!currentProjectItem) {
          // Project item is not found in current tree configuration
          currentProjectItem =
             this.workingConfig.getProxyFor(projectItems[projectItemIdx].id)
          lostProjectItems.push(currentProjectItem);
          continue;
        }

        foundProjectItems.push(currentProjectItem);
        let projectItemSubTree: Array<any> = currentProjectItem.getSubtreeAsList();

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
        projectItems : foundProjectItems,
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
      let projectItems = [];
      if (currentProject.relations.references.Project) {
        projectItems = currentProject.relations.references.Project.projectItems;
      }
      for (let projectItemIdx in projectItems) {
        let currentProjectItem: ItemProxy = projectItems[projectItemIdx];
        let projectItemSubTree: Array<any> = currentProjectItem.getSubtreeAsList();
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
        proxy: currentProject,
        projectItems : projectItems
      })
    }
    return projectList;
  }
}

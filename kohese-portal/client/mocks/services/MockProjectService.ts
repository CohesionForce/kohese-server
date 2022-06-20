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
import { BehaviorSubject } from 'rxjs';

// Kohese
import { TreeConfiguration } from '../../../common/src/tree-configuration';
import { ProjectInfo } from '../../src/services/project-service/project.service';
import { DashboardSelections } from '../../src/components/dashboard/dashboard-selector/dashboard-selector.component';

export class MockProjectService {
  public constructor() {}

  dashboardSelectionStream : BehaviorSubject<DashboardSelections> = new BehaviorSubject<DashboardSelections>(null);

  public getProjects(): Array<ProjectInfo> {
    return [{
      proxy: TreeConfiguration.getWorkingTree().getRootProxy(),
      users: [],
      projectItems: []
    }];
  }

  public isHistorical(): boolean {
    return false;
  }

  public generateWorkingProjects(): Array<ProjectInfo> {
    return this.getProjects();
  }
}

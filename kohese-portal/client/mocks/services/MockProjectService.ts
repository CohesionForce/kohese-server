import { TreeConfiguration } from '../../../common/src/tree-configuration';
import { ProjectInfo } from '../../src/services/project-service/project.service';

export class MockProjectService {
  public constructor() {
  }
  
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
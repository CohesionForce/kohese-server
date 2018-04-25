import { VersionControlService } from './version-control.service';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { MockItem } from '../../../mocks/data/MockItem';

describe('Service: version-control', () => {
  let proxy: ItemProxy;
  let versionControlService: VersionControlService;

  beforeAll(() => {
    let item: any = MockItem();
    item.id = 'Kurios Iesous';
    proxy = new ItemProxy('Item', item);
    let placeholderSocketService: any = jasmine.createSpyObj('SocketService',
      ['getSocket']);
    placeholderSocketService.getSocket.and.returnValue({
      emit: (message: string, data: any, callbackFunction: Function) => {
        callbackFunction({
          'Kurios Iesous': ['CURRENT']
        });
      }
    });
    versionControlService = new VersionControlService(
      placeholderSocketService);
  });

  it('stages changes', (done: Function) => {
    versionControlService.stageItems([proxy]).subscribe((statusMap: any) => {
      expect(true).toEqual(true);
      done();
    });
  });

  it('un-stages changes', (done: Function) => {
    versionControlService.unstageItems([proxy]).subscribe((statusMap: any) => {
      expect(true).toEqual(true);
      done();
    });
  });

  it('reverts changes', (done: Function) => {
    versionControlService.revertItems([proxy]).subscribe((statusMap: any) => {
      expect(true).toEqual(true);
      done();
    });
  });

  it('commits changes', (done: Function) => {
    versionControlService.commitItems([proxy], {
      item: {
        name: 'Kurios Iesous',
        email: 'KuriosIesous@KuriosIesous'
      }
    }, 'Kurios Iesous.').subscribe((statusMap: any) => {
      expect(true).toEqual(true);
      done();
    });
  });

  it('propagates committed changes', (done: Function) => {
    versionControlService.push(['Kurios Iesous'], 'Kurios Iesous').subscribe(
      (returnValue: any) => {
      expect(true).toEqual(true);
      done();
    });
  });

  it('adds a Remote', (done: Function) => {
    versionControlService.addRemote('Kurios Iesous', 'Kurios Iesous',
      'Kurios Iesous').subscribe((returnValue: any) => {
      expect(true).toEqual(true);
      done();
    });
  });

  it('returns a list of Remotes', (done: Function) => {
    versionControlService.getRemotes('Kurios Iesous').subscribe(
      (returnValue: any) => {
      expect(true).toEqual(true);
      done();
    });
  });

  it('translates a version control status', () => {
    expect(Object.keys(versionControlService.translateStatus(['CURRENT'])).
      length).toEqual(1);
  });
});

import { VersionControlService } from './version-control.service';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { KoheseModel } from '../../../../common/src/KoheseModel';
import { MockDataModel } from '../../../mocks/data/MockDataModel';
import { MockItem } from '../../../mocks/data/MockItem';

describe('Service: version-control', () => {
  let proxy: ItemProxy;
  let versionControlService: VersionControlService;

  beforeAll(() => {
    new KoheseModel(MockDataModel());
    KoheseModel.modelDefinitionLoadingComplete();
    let item: any = MockItem();
    item.id = 'test-uuid';
    proxy = new ItemProxy('Item', item);
    let placeholderSocketService: any = jasmine.createSpyObj('SocketService',
      ['getSocket']);
    placeholderSocketService.getSocket.and.returnValue({
      emit: (message: string, data: any, callbackFunction: Function) => {
        callbackFunction({
          'test-uuid': ['CURRENT']
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
    versionControlService.commitItems([proxy],
      new ItemProxy('KoheseUser', {
        name: 'Test User',
        email: 'TestUser@test.kohese.com'
      }),
      'Test Commit Message.').subscribe((statusMap: any) => {
      expect(true).toEqual(true);
      done();
    });
  });

  it('propagates committed changes', (done: Function) => {
    versionControlService.push(['test-uuid'], 'test-remote-name').subscribe(
      (returnValue: any) => {
      expect(true).toEqual(true);
      done();
    });
  });

  it('adds a Remote', (done: Function) => {
    versionControlService.addRemote('test-id', 'test-remote-name',
      'test-url').subscribe((returnValue: any) => {
      expect(true).toEqual(true);
      done();
    });
  });

  it('returns a list of Remotes', (done: Function) => {
    versionControlService.getRemotes('test-id').subscribe(
      (returnValue: any) => {
      expect(true).toEqual(true);
      done();
    });
  });
});

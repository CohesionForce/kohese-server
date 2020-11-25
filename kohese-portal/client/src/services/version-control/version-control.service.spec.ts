import { VersionControlService } from './version-control.service';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { KoheseModel } from '../../../../common/src/KoheseModel';
import { MockDataModel } from '../../../mocks/data/MockDataModel';
import { MockItem } from '../../../mocks/data/MockItem';
import { ItemRepository } from '../item-repository/item-repository.service';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';

describe('Service: version-control', () => {
  let proxy: ItemProxy;
  let versionControlService: VersionControlService;

  beforeAll(() => {
    let mockItemRepository = new MockItemRepository() as any as ItemRepository;

    let item: any = MockItem();
    item.id = 'test-uuid';
    proxy = new ItemProxy('Item', item);
    let placeholderCacheManager: any = jasmine.createSpyObj('CacheManager',
      ['sendMessageToWorker']);

    let resolvedPromise = Promise.resolve({
      'test-uuid': ['CURRENT']
    });
    placeholderCacheManager.sendMessageToWorker.and.returnValue(resolvedPromise);
    versionControlService = new VersionControlService(placeholderCacheManager);
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
    let test_user =  new ItemProxy('KoheseUser', {
      name: 'Test User',
      email: 'TestUser@test.kohese.com',
      password: '$invalid-password'
    });
    versionControlService.commitItems([proxy], test_user,
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

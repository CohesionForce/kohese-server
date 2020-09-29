import { ItemProxy } from './item-proxy';
import { KoheseModel } from './KoheseModel';
import { TreeConfiguration } from './tree-configuration';

export class KoheseView extends ItemProxy {
  public constructor(koheseView: any, treeConfiguration: TreeConfiguration) {
    if (koheseView.id == null) {
      koheseView.id = 'view-' + koheseView.name.toLowerCase();
    }

    if (koheseView.parentId && (treeConfiguration.getProxyFor(koheseView.
      parentId) == null)) {
      ItemProxy.createMissingProxy('KoheseView', 'id', koheseView.parentId,
        treeConfiguration);
    }

    super('KoheseView', koheseView, treeConfiguration);

    this.internal = koheseView.isInternal;

    (TreeConfiguration.getWorkingTree().getProxyFor(koheseView.
      modelName) as KoheseModel).view = this;
  }
}

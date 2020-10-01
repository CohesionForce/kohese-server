import { ItemProxy } from './item-proxy';
import { KoheseModel } from './KoheseModel';
import { TreeConfiguration } from './tree-configuration';

export class KoheseView extends ItemProxy {
  public constructor(koheseView: any, treeConfig?: TreeConfiguration) {
    if (!treeConfig) {
      treeConfig = TreeConfiguration.getWorkingTree();
    }

    if (koheseView.id == null) {
      koheseView.id = 'view-' + koheseView.name.toLowerCase();
    }

    if (koheseView.parentId && (treeConfig.getProxyFor(koheseView.
      parentId) == null)) {
      ItemProxy.createMissingProxy('KoheseView', 'id', koheseView.parentId,
        treeConfig);
    }

    super('KoheseView', koheseView, treeConfig);

    this.internal = koheseView.isInternal;

    // Associate view with the model
    let modelProxy = KoheseModel.getModelProxyFor(koheseView.modelName);
    modelProxy.view = this;
  }
}

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
    if (modelProxy) {
      modelProxy.view = this;
    } else {
      console.log('*** Could not find model for view: ' + koheseView.name + ' - ' + koheseView.id);
    }
  }
}

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
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';

// NPM

// Kohese
import { CacheManager } from '../../../../cache-worker/CacheManager';

@Component({
  selector: 'about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutComponent implements OnInit {

  // Data
  scripts: Array<string> = [];
  cacheWorkerAttributes: Array<string>;
  commitInfo: Array<string> = [];
  @Input() gitCommitInfo: any = {};

  constructor(
    private changeRef : ChangeDetectorRef,
    private cacheManager : CacheManager
  ){}

  ngOnInit(){
    this.getGitCommitInfo().then(() => {
      this.changeRef.detectChanges();
    });

    // this.scripts = this.buildInfo();
  }

  //////////////////////////////////////////////////////////
  // Retrieve git commit info
  //////////////////////////////////////////////////////////
  private async getGitCommitInfo() {
    let response = await this.cacheManager.sendMessageToWorker('About/getCommitInfo', {}, true);
    this.gitCommitInfo = response;
  }

  /////////////////////////////////////////////////////
  // Returns current Angular build info
  /////////////////////////////////////////////////////
  // buildInfo(){
  //   let scripts: any = document.scripts;
  //   let cacheWorkerBundle: string;

  //   scriptLoop: for (let scriptIdx in scripts) {
  //     let script: any = scripts[scriptIdx];
  //     if (script.attributes) {
  //       for (let idx in script.attributes) {
  //         let attribute: any = script.attributes[idx];
  //         if (attribute.value) {
  //           cacheWorkerBundle = attribute.value;
  //           this.cacheWorkerAttributes[scriptIdx] = cacheWorkerBundle;
  //           if (attribute.value.match(/^scripts/)) {
  //             break scriptLoop;
  //           }
  //         }
  //       }
  //     }
  //   }

  //   return this.cacheWorkerAttributes;
  // }


}

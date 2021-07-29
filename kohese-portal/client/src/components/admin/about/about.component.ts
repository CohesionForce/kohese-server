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
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { Title } from '@angular/platform-browser';

// Other External Dependencies

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
  @Input() buildComponents: any;
  @Input() gitCommitInfo: any = {};
  @Input() bundleInfo: Array<string> = [];


  constructor(
    private changeRef : ChangeDetectorRef,
    private cacheManager : CacheManager,
    private title : Title
  ){
    this.title.setTitle('About');
  }

  ngOnInit(){
    this.getGitCommitInfo().then(() => {
      this.changeRef.detectChanges();
    });

    this.buildComponents = this.getBundleInfo();
    this.changeRef.detectChanges();
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
  private getBundleInfo(): Array<any> {
    // scripts contains the entirety of the HtmlCollectionElement Array of scripts
    let scripts: any = document.scripts;
    for (let scriptIdx in scripts) {
      let script: any = scripts[scriptIdx];
      // [0]=type [1]=src
      if (script.attributes && script.attributes[1]) {
        let attribute: any = script.attributes[1];
        // value contains bundle info "runtime", "polyfills", "scripts", and "main" '.js' files.
        if (attribute.value) {
          this.bundleInfo.push(attribute.value);
        }
      }
    }

    return this.bundleInfo;
  }

}

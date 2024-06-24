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



type SimulatedRequestType = {
  message: string,
  data: any
}

export class MockCacheManager {
  constructor() {}

  simulatedData: Map<SimulatedRequestType, any>;

  clearSimulatedData() {
    this.simulatedData.clear();
  }

  sendMessageToWorker(message: string, data: any, expectResponse: boolean): Promise<any> {

    console.log('??? message: ' + message);
    console.log('??? data: ');
    console.log(data);
    return new Promise<any>((resolve: (data: any) => void, reject: () => void) => {
      //TODO: Return a resolve promise for any messsage data pair
      let response = this.simulatedData.get({message: message, data: data});
      if(response) {
        resolve(response);
      } else {
        console.log('*** invalid response data');
        reject();
      }
    });
  }

  simulateResponseFromWorker(message: string, data: any, response: any) {
    //TODO: store message data in a structure
    this.simulatedData.set({message: message, data: data}, response);
  }
}

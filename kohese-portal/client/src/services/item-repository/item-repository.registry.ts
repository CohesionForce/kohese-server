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


import { LogService } from "../log/log.service";

export function InitializeLogs (logService : LogService) {
  let componentId = logService.getComponentId('ItemRepository');
  let LogEvents = {
    'itemRepoInit' : logService.getEventId(componentId, 'ItemRepoInit'),
    'receivedNofificationOfChange' : logService.getEventId(componentId, 'ReceivedNofificationOfChange'),
    'itemProxyLoaded' : logService.getEventId(componentId, 'Item Proxy is Loaded'),
    'itemProxyLoading' : logService.getEventId(componentId, 'Item Proxy is Loading'),
    'itemRepositoryAuthenticated' : logService.getEventId(componentId, 'Item Repository authenticated'),
    'socketAlreadyConnected' : logService.getEventId(componentId, 'Socket Already Connected'),
    'itemCreated' : logService.getEventId(componentId, 'Item Created'),
    'itemUpdated' : logService.getEventId(componentId, 'Item Updated'),
    'itemDeleted' : logService.getEventId(componentId, 'Item Deleted'),
    'bulkUpdate' : logService.getEventId(componentId, 'Bulk Update'),
    'versionControlStatusUpdated' : logService.getEventId(componentId, 'Version Control Status Updated'),
    'socketError' : logService.getEventId(componentId, 'Socket Error'),
    'socketReconnect' : logService.getEventId(componentId, 'Reconnecting to Server'),
    'socketAuthenticating' : logService.getEventId(componentId, 'Authenticating Socket'),
    'socketAuthenticated' : logService.getEventId(componentId, 'Socket Authenticated'),
    'processBulkUpdate' : logService.getEventId(componentId, 'Processing Bulk Update'),
    'processBulkKind' : logService.getEventId(componentId, 'Processing kind'),
    'bulkError' : logService.getEventId(componentId, 'Error processing item'),
    'fetchTime' : logService.getEventId(componentId, '$$$ Fetch Time'),
    'processProxyMetaModel' : logService.getEventId(componentId, 'Processing Metamodel'),
    'processCache' : logService.getEventId(componentId, 'Processing Cache'),
    'retrieveHeadCommit' : logService.getEventId(componentId, 'Retrieving Head Commit'),
    'loadHeadCommit' : logService.getEventId(componentId, 'Loading Head Commit'),
    'bulkUpdateProcessingTime' : logService.getEventId(componentId, '$$$ Bulk Update Processing Time'),
    'treeHashProcessingTime' : logService.getEventId(componentId, '$$$ Tree Hash Processing Time'),
    'fetchAll' : logService.getEventId(componentId, 'Fetch All Items'),
    'fetchingAll' : logService.getEventId(componentId, 'Fetching All Items'),
    'getAll' : logService.getEventId(componentId, 'Requesting getAll'),
    'repoSyncRequest' : logService.getEventId(componentId, 'Requesting Repo Sync'),
    'getAllResponse' : logService.getEventId(componentId, 'Response for getAll'),
    'kdbSynced' : logService.getEventId(componentId, 'KDB synced'),
    'compareHashAfterUpdate' : logService.getEventId(componentId, ' Compare Repo Tree Hashed After Update'),
    'repoSyncFailed' : logService.getEventId(componentId, 'Repository Sync Failed'),
    'failedProxySync' : logService.getEventId(componentId, 'Failed Proxy Sync : '),
    'compareTreeHashProcessingTime' : logService.getEventId(componentId, 'Compare Tree Hash Time'),
    'waitingOnRepoSync' : logService.getEventId(componentId, 'Still waiting on repo sync'),
    'createError' : logService.getEventId(componentId, 'Error during create'),
    'createSuccess' : logService.getEventId(componentId, 'Create Succeed'),
    'deletingItem' : logService.getEventId(componentId, 'Prepared to delete item'),
    'generateHTMLReport' : logService.getEventId(componentId, 'HTML Report Generation'),
    'generateDOCXReport' : logService.getEventId(componentId, 'DOCX Report Generation'),
    'retrieveVCStatus' : logService.getEventId(componentId, 'VC Status Retrieved For'),
    'retrieveVCStatusFailed' : logService.getEventId(componentId, 'VC Item Not Found'),
    'performingAnalysis' : logService.getEventId(componentId, 'Performing analysis')


  }

  return LogEvents
}

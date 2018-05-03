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

// export const LogCategories = {
//     "ITEM_CREATE_UPDATES" : {
//       description: "Notifications of when an item is created",
//       id : "01" },
//     "ITEM_UPDATES" : {
//       description: "Notifications of when an item is updated",
//       id : "02"
//     },
//     "BULK_UPDATES" : {
//       description : "Notifications of large groups of updated items",
//       id : "03"
//     },
//     "ITEM_DELETE_UPDATES" : {
//       description: "Notifications of deleted items",
//       id : "04"
//     },
//     "ALL_PROXY_CHANGES" : {
//       description: "Listener on all proxy notifications",
//       id : "05"
//     },
//     "ITEM_REPOSITORY_INIT" : {
//       description: "Notifications about the initial repository load operation",
//       id : "06"
//     },
//     "ITEM_REPOSITORY_UPDATES" : {
//       description: "Notifications about the sync status of the item repository",
//       id : "07"
//     },
//     "ITEM_PROXY_INIT" : {
//       description : "Notifications about the item proxy model init",
//       id : "08"
//     },
//     "VERSION_CONTROL_UPDATES" : {
//       description : "Notifications about version control status",
//       id : "09"
//     },
//     "SOCKET_INFO" : {
//       description : "Notifications about the socket status",
//       id : "10"
//     },
//     "PERFORMANCE" : {
//       description : 'Performance metrics of the item repository',
//       id : "11"
//     },
//     "TREE_CONFIG_UPDATES" : {
//       description : "Updates on the tree config status",
//       id : "12"
//     },
//     "DOCUMENT_GENERATION" : {
//       description : "Information about document generation requests",
//       id : "13"
//     }, 
//     "ANALYSIS_INFO" : {
//       description : "Information about analysis information requests",
//       id : "14"
//     }
//   }
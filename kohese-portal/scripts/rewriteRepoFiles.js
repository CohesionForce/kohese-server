
 var kdb = require('../server/kdb.js');
 var ItemProxy = kdb.ItemProxy;
 
 var repos = ItemProxy.getRepositories();
 
 console.log("::: Repositories");
 
 for(var repoIdx in repos){
   var repo = repos[repoIdx];
   console.log("::: Repo: " + repo.item.name);
   var descendants = repo.getDescendants();
   for(var idx in descendants){
     var proxy = descendants[idx];
     console.log("--> " + proxy.kind + " - " + proxy.item.name);
     kdb.storeModelInstance(proxy.kind, proxy.item);
   }
 }
 

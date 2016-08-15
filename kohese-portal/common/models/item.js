module.exports = function (Item) {
    
    //////////////////////////////////////////////////////////////////////////
    //
    //////////////////////////////////////////////////////////////////////////
    Item.addModificationHistory = function(ctx, modelInstance, next){
        console.log('::: Before remote - ' + ctx.methodString);
        console.log(ctx.req.body);
        if(Array.isArray(ctx.req.body)) {
        	for(var i=0; i<ctx.req.body.length; i++) {
        		ctx.req.body[i].modifiedBy = ctx.req.headers.koheseUser.username;
        		ctx.req.body[i].modifiedOn = Date.now();
        	}
        } else {
        	ctx.req.body.modifiedBy = ctx.req.headers.koheseUser.username;
            ctx.req.body.modifiedOn = Date.now();
        }
        next();
    };

    //////////////////////////////////////////////////////////////////////////
    //
    //////////////////////////////////////////////////////////////////////////
    Item.beforeSaveKohese = function (ctx, next) {
      console.log('::: Before save - ' + ctx.Model.modelName);
      
      if (ctx.instance){
        if (!ctx.instance.createdBy){
          console.log('::: Updating created fields (instance) - ' + ctx.Model.modelName);
          ctx.instance.createdBy = ctx.instance.modifiedBy;
          ctx.instance.createdOn = ctx.instance.modifiedOn;
        }
        console.log(ctx.instance);
      }
      if (ctx.data){
        if (ctx.data.createdBy === null){
          console.log('::: Updating created fields (data) - ' + ctx.Model.modelName);
          ctx.data.createdBy = ctx.data.modifiedBy;
          ctx.data.createdOn = ctx.data.modifiedOn;
        }        
      }
      next();
    }
    
    //////////////////////////////////////////////////////////////////////////
    //
    //////////////////////////////////////////////////////////////////////////
    Item.afterSaveKohese = function (ctx, next) {
        console.log('::: After save - ' + ctx.Model.modelName);
        if (ctx.instance) {
            console.log('Saved %s #%s#%s#', ctx.Model.modelName, ctx.instance.id, ctx.instance.name);
            var notification = new Object;
            notification.model = ctx.Model.modelName;
            notification.id = ctx.instance.id;
            notification.ctx = ctx;
            console.log("Change Instance:" + JSON.stringify(notification));
            if (ctx.isNewInstance) {
                notification.type = 'create';
                global.KoheseIO.emit(ctx.Model.modelName +'/create', notification);
            } else {
                notification.type = 'update';
                global.KoheseIO.emit(ctx.Model.modelName +'/update', notification);
            }
            global.koheseKDB.storeModelInstance(ctx.Model.modelName, ctx.instance.toObject());
        } else {
            console.log('Updated %s matching %j',
                ctx.Model.pluralModelName,
                ctx.where);
            var notification = new Object;
            notification.model = ctx.Model.modelName;
            notification.id = ctx.where.id;
            notification.ctx = ctx;
            if (ctx.isNewInstance) {
                notification.type = 'create';
                global.KoheseIO.emit(ctx.Model.modelName +'/create', notification);

            } else {
                notification.type = 'update';
                global.KoheseIO.emit(ctx.Model.modelName +'/update', notification);
            }
            console.log("Change Multiple: " + JSON.stringify(notification));
        }
        
        if(ctx.Model.modelName === "Item"){
          //var Analysis = app.models.Analysis;
          console.log("::: Need to call Analysis update logic")
        }
        
        next();
    };
    
    //////////////////////////////////////////////////////////////////////////
    //
    //////////////////////////////////////////////////////////////////////////
    Item.afterDeleteKohese = function (ctx, next) {
        console.log('::: After delete - ' + ctx.Model.modelName);
        if (ctx.instance) {
            console.log('Deleted %s #%s#', ctx.Model.modelName, ctx);
            notification.type = 'delete';
            notification.model = ctx.Model.modelName;
            notification.ctx = ctx;
        } else {
            console.log('Deleted %s #%s#', ctx.Model.modelName, ctx.where.id);
            var notification = new Object;
            notification.type = 'delete';
            notification.model = ctx.Model.modelName;
            notification.id = ctx.where.id;
            notification.ctx = ctx;
            console.log("Change: " + JSON.stringify(notification));
            global.KoheseIO.emit(ctx.Model.modelName +'/delete', notification);
            global.koheseKDB.removeModelInstance(ctx.Model.modelName, notification.id);
        }
        next();
    };

    
    //////////////////////////////////////////////////////////////////////////
    //
    //////////////////////////////////////////////////////////////////////////
    Item.getHistory = function(req, onId, cb) {
      console.log("::: Getting history for " + onId);

      var instance = global.koheseKDB.ItemProxy.getProxyFor(onId);
      console.log("::: Getting history for " + instance.repoPath);
      
      global.koheseKDB.kdbRepo.walkHistoryForFile(global.koheseKDB.repoList.ROOT, instance.repoPath, function(history){
        
        if (history) {
          cb(null, history);
        } else {
          cb({error: "history error"}, null);
        }        
      });

      
    }

    Item.remoteMethod('getHistory', {
      accepts : [ {
        arg : 'req',
        type : 'object',
        'http' : {
          source : 'req'
        }
      }, {
        arg : 'onId',
        type : 'string'
      } ],
      returns : {
        arg : 'data',
        type : 'object'
      }
    });

    Item.afterRemoteError('getHistory', function(ctx, next) {
      ctx.res.status(ctx.error.http_code).end(ctx.error.message);
    });
    
    //////////////////////////////////////////////////////////////////////////
    //
    //////////////////////////////////////////////////////////////////////////
    Item.getStatus = function(req, onId, cb) {
      console.log("::: Getting status");

      var instance = global.koheseKDB.ItemProxy.getProxyFor(onId);
      
      global.koheseKDB.kdbRepo.getStatus(global.koheseKDB.repoList.ROOT, function(status){
        
        if (status) {
          cb(null, status);
        } else {
          cb({error: "status error"}, null);
        }        
      });

      
    }

    Item.remoteMethod('getStatus', {
      accepts : [ {
        arg : 'req',
        type : 'object',
        'http' : {
          source : 'req'
        }
      }, {
        arg : 'onId',
        type : 'string'
      } ],
      returns : {
        arg : 'data',
        type : 'object'
      }
    });

    Item.afterRemoteError('getStatus', function(ctx, next) {
      ctx.res.status(ctx.error.http_code).end(ctx.error.message);
    });
    
    //////////////////////////////////////////////////////////////////////////
    //
    //////////////////////////////////////////////////////////////////////////
    Item.beforeRemote('create', Item.addModificationHistory);
    Item.beforeRemote('upsert', Item.addModificationHistory);
    Item.observe('before save', Item.beforeSaveKohese);
    Item.observe('after save', Item.afterSaveKohese);
    Item.observe('after delete', Item.afterDeleteKohese);

};

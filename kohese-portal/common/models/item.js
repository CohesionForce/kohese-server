module.exports = function (Item) {
  
    var fs = require('fs');
    var path = require('path');
    var child = require('child_process');
    var ItemProxy = require('./item-proxy.js');
    var kio = require('../../server/koheseIO.js');
    
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
    };
    
    //////////////////////////////////////////////////////////////////////////
    //
    //////////////////////////////////////////////////////////////////////////
    Item.afterSaveKohese = function (ctx, next) {
        console.log('::: After save - ' + ctx.Model.modelName);
        if (ctx.instance) {
        	global.koheseKDB.storeModelInstance(ctx.Model.modelName, ctx.instance.toObject()).then(function (status) {
        	  console.log('Saved %s #%s#%s#', ctx.Model.modelName, ctx.instance.id, ctx.instance.name);
            var notification = {};
            notification.kind = ctx.Model.modelName;
            notification.item = ctx.instance;
            notification.status = status;
            console.log('Change Instance:' + JSON.stringify(notification));
            if (ctx.isNewInstance) {
                notification.type = 'create';
                kio.server.emit(ctx.Model.modelName +'/create', notification);
            } else {
                notification.type = 'update';
                kio.server.emit(ctx.Model.modelName +'/update', notification);
            }
            
            next();
        	});
        } else {
            console.log('*** Updated %s matching %j',
                ctx.Model.pluralModelName,
                ctx.where);
            var notification = {};
            notification.kind = ctx.Model.pluralModelName;
            notification.id = ctx.where.id;
            notification.ctx = ctx;
            if (ctx.isNewInstance) {
                notification.type = 'create';
                kio.server.emit(ctx.Model.modelName +'/create', notification);

            } else {
                notification.type = 'update';
                kio.server.emit(ctx.Model.modelName +'/update', notification);
            }
            console.log('*** Change Multiple: ' + JSON.stringify(notification));
            
            next();
        }
        
        if(ctx.Model.modelName === 'Item'){
          //var Analysis = app.models.Analysis;
          console.log('::: Need to call Analysis update logic');
        }
    };
    
    //////////////////////////////////////////////////////////////////////////
    //
    //////////////////////////////////////////////////////////////////////////
    Item.afterDeleteKohese = function (ctx, next) {
        console.log('::: After delete - ' + ctx.Model.modelName);
        var notification = {};
        if (ctx.instance) {
            console.log('Deleted %s #%s#', ctx.Model.modelName, ctx);
            notification.type = 'delete';
            notification.kind = ctx.Model.modelName;
            notification.id = ctx.id;
        } else {
            console.log('Deleted %s #%s#', ctx.Model.modelName, ctx.where.id);
            notification.type = 'delete';
            notification.kind = ctx.Model.modelName;
            notification.id = ctx.where.id;
            console.log('Change: ' + JSON.stringify(notification));
            kio.server.emit(ctx.Model.modelName +'/delete', notification);
            global.koheseKDB.removeModelInstance(ctx.Model.modelName, notification.id);
        }
        next();
    };

    
    //////////////////////////////////////////////////////////////////////////
    //
    //////////////////////////////////////////////////////////////////////////
    Item.getHistory = function(req, onId, cb) {
      //console.log('::: Getting history for ' + onId);

      var proxy = global.koheseKDB.ItemProxy.getProxyFor(onId);
      console.log('::: Getting history for ' + proxy.repoPath);
      
      global.koheseKDB.kdbRepo.walkHistoryForFile(proxy.repoPath, function(history){
        
        if (history) {
          cb(null, history);
        } else {
          cb({error: 'history error'}, null);
        }        
      });

      
    };

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
      // jshint -W106
      ctx.res.status(ctx.error.http_code).end(ctx.error.message);
      // jshint +W106
    });
    
    //////////////////////////////////////////////////////////////////////////
    //
    //////////////////////////////////////////////////////////////////////////
    Item.getStatus = function(req, onId, cb) {
      console.log('::: Getting status for ' + onId);
      //var instance = global.koheseKDB.ItemProxy.getProxyFor(repoId);
      global.koheseKDB.kdbRepo.getStatus(global.koheseKDB.ItemProxy.getRootProxy().item.id, function(status){
        
        if (status) {
          cb(null, status);
        } else {
          console.log('*** Error (Returned from getStatus)');
          console.log(status);
          cb({error: 'status error'}, null);
        }        
      });

      
    };

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
      console.log('*** Error (After Remote)');
      console.log(ctx.error);
      // jshint -W106
      ctx.res.status(ctx.error.http_code).end(ctx.error.message);
      // jshint +W106

    });
    
    //////////////////////////////////////////////////////////////////////////
    //
    //////////////////////////////////////////////////////////////////////////
    Item.generateReport = function(req, forItemId, outFormat, cb) {

      var showUndefined;
      
      var proxy = global.koheseKDB.ItemProxy.getProxyFor(forItemId);
      var result = {};

      if (!proxy){
        console.log('*** Could not find proxy for: ' + forItemId);        
        cb({error: 'Item not found: ' + forItemId}, null);
        return;
      }

      console.log('::: Found proxy for: ' + forItemId + ' - ' + proxy.item.name);        

      var reportTime = new Date();

      var outputBuffer = '::: Dump of ' + forItemId + ': ' + proxy.item.name + ' at ' +
          reportTime.toDateString() + ' ' + reportTime.toTimeString() + '\n\n';

      outputBuffer += proxy.getDocument(showUndefined);

      var itemName = proxy.item.name.replace(/[:\/]/g, ' ');
      var fileBasename ='dump.' + forItemId + '.' + itemName;
      var dumpFile= 'tmp_reports/' + fileBasename + '.md';
      console.log('::: Creating: ' + dumpFile);
      
      fs.writeFileSync(dumpFile, outputBuffer, {encoding: 'utf8', flag: 'w'});
      result.markdown = 'reports/' + fileBasename + '.md';
      
      if (outFormat) {
        console.log('::: Now spawning pandoc...');
        var outFile = 'tmp_reports/' + fileBasename + '.' + outFormat;
        console.log('::: Creating ' + outFile);
        var pandoc = child.spawnSync('pandoc', ['-f', 'markdown', '-t', outFormat, dumpFile, '-o', outFile]);
        if(pandoc.stdout) {
          console.log(pandoc.stdout);
        }
        result[outFormat] = 'reports/' + fileBasename + '.' + outFormat;
        console.log('Pandoc done!');
      }
      
      cb(null, result);

    };
    
    //////////////////////////////////////////////////////////////////////////
    //
    //////////////////////////////////////////////////////////////////////////
    Item.generateHTMLReport = function(req, onId, cb) {
      console.log('::: Generating HTML Report for ' + onId);

      Item.generateReport(req, onId, 'html', cb);
      
    };

    Item.remoteMethod('generateHTMLReport', {
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

    Item.afterRemoteError('generateHTMLReport', function(ctx, next) {
      // jshint -W106
      ctx.res.status(ctx.error.http_code).end(ctx.error.message);
      // jshint +W106
    });
    
    //////////////////////////////////////////////////////////////////////////
    //
    //////////////////////////////////////////////////////////////////////////
    Item.generateDOCXReport = function(req, onId, cb) {
      console.log('::: Generating DOCX Report for ' + onId);


      Item.generateReport(req, onId, 'docx', cb);
      
    };

    Item.remoteMethod('generateDOCXReport', {
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

    Item.afterRemoteError('generateDOCXReport', function(ctx, next) {
      // jshint -W106
      ctx.res.status(ctx.error.http_code).end(ctx.error.message);
      // jshint +W106
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

module.exports = function(Item) {

	var app = require('../../server/server.js');
  var http = require('http');
  var util = require('util');
//  console.log(util.inspect(app.loopback,false,null));
 
	Item.observe('after save', function(ctx, next) {
		  if (ctx.instance) {
		    console.log('Saved %s #%s#%s#', ctx.Model.modelName, ctx.instance.id, ctx.instance.title);
		    var notification = new Object;
		    notification.model = ctx.Model.modelName;
		    notification.id = ctx.instance.id;
		    notification.ctx = ctx;
		    console.log("Change Instance:" + JSON.stringify(notification));
        if (ctx.isNewInstance) {
          notification.type = 'create';
          app.io.emit('item/create', notification);
        } else {
          notification.type = 'update';         
          app.io.emit('item/update', notification);
        }
		    app.io.emit('change', JSON.stringify(notification));
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
          app.io.emit('item/create', notification);

        } else {
          notification.type = 'update';         
          app.io.emit('item/update', notification);
        }
        console.log("Change Multiple: " + JSON.stringify(notification));
		    app.io.emit('change', JSON.stringify(notification));
		  }
		  next();
		});
	
	Item.observe('after delete', function(ctx, next) {
		  if (ctx.instance) {
		    console.log('Deleted %s #%s#', ctx.Model.modelName, ctx);
			notification.type = 'delete';		    	
		    notification.model = ctx.Model.modelName;
		    notification.ctx = ctx;
		  } else {
		    console.log('Deleted %s #%s#', ctx.Model.modelName, ctx.where);
		    var notification = new Object;
			notification.type = 'delete';		    	
		    notification.model = ctx.Model.modelName;
		    notification.id = ctx.where.id;
		    notification.ctx = ctx;
		    console.log("Change: " + JSON.stringify(notification));
        app.io.emit('item/delete', notification);
		    app.io.emit('change', JSON.stringify(notification));
		  }
		  next();
		});

  Item.performAnalysis = function(onId, cb) {

    
    console.log('::: ANALYZING: ' + onId);
    
    var options = {
        host: "localhost",
        port: 9091,
        path: '/services/analysis/' + onId,
        method: 'GET'
      };

    console.log('OPTIONS: ' + JSON.stringify(options));
    
    http.request(options, function(res) {
        var response = "";
        // console.log('STATUS: ' + res.statusCode);
        // console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
           
        // console.log('::: BODY: ' /* + chunk*/);
        response += chunk.toString();
          
        });
        res.on('end', function (){
          console.log("::: Before setting Analysis");
//          console.log(util.inspect(app.loopback.Application.definition.modelBuilder.models));
          var Analysis = app.loopback.Application.definition.modelBuilder.models.Analysis;
          console.log("::: After setting Analysis");
          
          var analysis = new Analysis;
          analysis.id = onId;
          try {
            analysis.raw = JSON.parse(response);
            analysis.save();            
          }
          catch(err) {
            console.log("*** Error parsing result for: " + onId);
            console.log("Analysis response:  >>>" + response + "<<<");
            console.log(err);
          }
          
          cb(null, analysis.raw);          
        });
      }).end();


  }

  Item.remoteMethod('performAnalysis', {
    accepts : {
      arg : 'onId',
      type : 'string'
    },
    returns : {
      arg : 'raw',
      type : 'object'
    }
  });

};

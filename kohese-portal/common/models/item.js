module.exports = function(Item) {

	var app = require('../../server/server.js');
	
	Item.observe('after save', function(ctx, next) {
		  if (ctx.instance) {
		    console.log('Saved %s #%s#%s#', ctx.Model.modelName, ctx.instance.id, ctx.instance.title);
		    var notification = new Object;
		    if (ctx.isNewInstance) {
			    notification.type = 'create';

		    } else {
			    notification.type = 'update';		    	
		    }
		    notification.model = ctx.Model.modelName;
		    notification.id = ctx.instance.id;
		    notification.ctx = ctx;
		    console.log(JSON.stringify(notification));
		    app.io.emit('change', JSON.stringify(notification));
		  } else {
		    console.log('Updated %s matching %j',
		      ctx.Model.pluralModelName,
		      ctx.where);
		    var notification = new Object;
		    if (ctx.isNewInstance) {
			    notification.type = 'create';

		    } else {
			    notification.type = 'update';		    	
		    }
		    notification.model = ctx.Model.modelName;
		    notification.id = ctx.where.id;
		    notification.ctx = ctx;
		    console.log(JSON.stringify(notification));
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
		    console.log(JSON.stringify(notification));
		    app.io.emit('change', JSON.stringify(notification));
		  }
		  next();
		});
	
};

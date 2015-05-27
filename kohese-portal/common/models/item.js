module.exports = function(Item) {

	//var io = require('socket.io');
	//var app = require('loopback');
	var app = require('../../server/server.js');
	
	Item.observe('after save', function(ctx, next) {
		  if (ctx.instance) {
		    console.log('Saved %s #%s#%s#', ctx.Model.modelName, ctx.instance.id, ctx.instance.title);
		    console.log(JSON.stringify(ctx));
		    app.io.emit('change', JSON.stringify(ctx));
		  } else {
		    console.log('Updated %s matching %j',
		      ctx.Model.pluralModelName,
		      ctx.where);
		  }
		  next();
		});
	
};

module.exports = function(Item) {

	//var io = require('socket.io');
	//var app = require('loopback');
	
	Item.observe('after save', function(ctx, next) {
		  if (ctx.instance) {
		    console.log('Saved %s #%s#%s#', ctx.Model.modelName, ctx.instance.id, ctx.instance.title);
		    console.log(JSON.stringify(ctx));
//		    app.io.emit('chat message', 'hello');
		  } else {
		    console.log('Updated %s matching %j',
		      ctx.Model.pluralModelName,
		      ctx.where);
		  }
		  next();
		});
	
};

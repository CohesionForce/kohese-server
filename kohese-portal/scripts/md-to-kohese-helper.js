/** The render methods used by md-to-kohese.js to parse AST back to commonmark.
 *  Apparently AST to commonmark is implemented in the reference C
 *  implementation, cmark, of commonmark. May then want to use
 *  commonmark.c to determine proper conversion.
 */

var Render = {
		buffer: '',
		
		clearBuffer: function() {
			this.buffer = '';
		},
		getBuffer: function() {
			return this.buffer;
		},
		
		// Start standard CM Tokens
		block_quote: function(node, entering) {
			if(entering) {
				this.buffer += '> ';
			}
		},
		
		code_block: function(node, entering) {
			this.buffer += '\n```\n';
		},
		
		emph: function(node, entering) {
			this.buffer += '*';
		},
		
//		heading: function(node, entering) {
//Purposefully omitted as headings are treated differently	
//		},
		
		html_block: function(node, entering) {
			this.buffer += node.literal;
		},
		
		html_inline: function(node, entering) {
			this.buffer += node.literal;
		},
		
		image: function(node, entering) {
			if(entering) {
				this.buffer += '![';
			}
			else {
				this.buffer += '](' + node.destination + ' "' + node.title + '")';
			}
		},
		
		item: function(node, entering) {
			if(entering) {
				for(var i = 0; i < this.listDepth; i++) {
					this.buffer += '\t';
				}
				this.buffer += '+  ';
			}
		},
		
		linebreak: function(node, entering) {
			this.buffer += '\n';
		},
		
		link: function(node, entering) {
			if(entering) {
				this.buffer += '[';
			}
			else {
				this.buffer += '](' + node.destination + ' "' + node.title + '")';
			}
		},
		
		listDepth: 0,
		list: function(node, entering) {
			if(entering) {
				this.listDepth++;
			} else {
				this.listDepth--;
			}
		},
		
		paragraph: function(node, entering) {
			if(entering) {
				//nothing on enter?
			} else {
				this.buffer += '\n\n'; // space or \n\n may be valid
			}
		},

		softbreak: function(node, entering) {
			this.buffer += ' '; // space or \n may be valid
		},
		
		strong: function(node, entering) {
			this.buffer += '**';
		},

		text: function(node, entering) {
			this.buffer += node.literal;
		},
		
		thematic_break: function(node, entering) {
			this.buffer += '___'; //Need line break?
		}
};

module.exports = Render;
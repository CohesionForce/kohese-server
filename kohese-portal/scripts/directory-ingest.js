/** Directory ingester to Kohese
 *  Usage: node scripts/directory-ingest.js <basePath> <parentId> <rootName>
 *  
 *  Requires: pandoc globally, soffice globally (libreoffice)
 */

var fs = require('fs');
var Path = require('path');
var child = require('child_process');
var http = require('http');

var mdToKohese = require('./md-to-kohese.js');

var basePath, parentId, rootName, rootId;

// Begin Argument Processing
if (process.argv[2]) {
	basePath = process.argv[2]
} else {
	console.log('Error: No path provided.');
	console.log('Usage: node scripts/directory-ingest.js <basePath> <parentId> <rootName>');
	process.exit();
}
if (process.argv[3]) {
	parentId = process.argv[3];
} else {
	parentId = '';
}
if (process.argv[4]) {
	rootName = process.argv[4];
} else {
	rootName = basePath;
}
// End Argument Processing

// Start parsing the directory list to obtain all subdirectories and contained files.
try {
	var fileList = fs.readdirSync(basePath);
} catch (err) {
	console.log('An error occured while reading the given directory.');
	console.log(err);
	process.exit();
}

var accessToken;
try { 
	accessToken = fs.readFileSync('./scripts/token.jwt');
} catch(err) {
	console.log('Error reading token file. Please run "node scripts/login.js"');
	process.exit();
}

// Add the basePath to the file list to get proper paths
function fullPaths(list, path) {
	for (var i = 0; i < list.length; i++) {
		list[i] = Path.normalize(path + '/' + list[i]);
	}
	return list;
}

fileList = fullPaths(fileList, basePath);

var fileListTypes = [];
for (var i = 0; i < fileList.length; i++) {
	
	var fileStat = fs.lstatSync(fileList[i]);
	
    if (fileStat.isDirectory()) {
    	var subdirList = fs.readdirSync(fileList[i]);
    	
    	if (subdirList.length > 0) {
    		fileListTypes.push('dir');
    		subdirList = fullPaths(subdirList, fileList[i]);
        	fileList = fileList.concat(subdirList);
        } else {
        	// Remove empty subdirectories from consideration
        	fileList.splice(i,1);
        	i--;
        }
    } else if (fileStat.isFile()) {
    	if (fileStat.size !== 0) {
    		fileListTypes.push('file');
    	} else {
    		// Remove empty files from consideration
    		fileList.splice(i,1)
    		i--;
    	}
    	
    } else {
    	fileListTypes.push('other');
    	console.log('!!! Warning: ' + fileList[i] + ' is not a file or directory.');
    }
}

// Process files to MD if possible
console.log('Starting processing of ' + fileList.length + ' entities');
var count = 0;
for (var i = 0; i < fileList.length; i++) {
	if (fileListTypes[i] === 'file') {
		var ext = Path.extname(fileList[i]);
		processToMarkdown(fileList[i]);
		count++;
	}
}
console.log('Processed ' + count + ' files');

function processToMarkdown(filePath) {
	var path = Path.parse(filePath);
//	console.log('Starting processing of ' +  filePath);
	
	switch (path.ext) {
	case '.doc':
		// doc processing
		console.log('::: Processing doc to odt');
		var soffice = child.spawnSync('soffice', ['--headless', '--convert-to', 'odt', path.base], { cwd: path.dir, encoding : 'utf8' });
		if(soffice.stdout) {
			console.log(soffice.stdout);
		}
	case '.odt':
		// odt processing
		console.log('::: Processing odt to md');
		var pandoc = child.spawnSync('pandoc', ['-f', 'odt', '-t', 'markdown', '--atx-headers', path.name + '.odt', '-o', path.name + '.md'], { cwd: path.dir, encoding : 'utf8' });
		if(pandoc.stdout) {
			console.log(pandoc.stdout);
		}
		break;
	case '.docx':
		// docx processing
		console.log('::: Processing docx to md');
		var pandoc = child.spawnSync('pandoc', ['-f', 'docx', '-t', 'markdown', '--atx-headers', path.base, '-o', path.name + '.md'], { cwd: path.dir, encoding : 'utf8' });
		if(pandoc.stdout) {
			console.log(pandoc.stdout);
		}
		break;
	case '.htm':
	case '.html':
		// html processing
		console.log('::: Processing html to md');
		var pandoc = child.spawnSync('pandoc', ['-f', 'html', '-t', 'markdown', '--atx-headers', path.base, '-o', path.name + '.md'], { cwd: path.dir, encoding : 'utf8' });
		if(pandoc.stdout) {
			console.log(pandoc.stdout);
		}
		break;
	case '.md':
		// No Processing needed.
		break;
	default:
		console.log('!!! Unhandled extension: ' + path.ext + ' in ' + filePath);
	}
	
	console.log('Done processing file ' + path.base);
}

// Now re-parse the directory structure but only store directories and markdown files.
fileList = fs.readdirSync(basePath);
fileList = fullPaths(fileList, basePath);
fileListTypes = [];

for (var i = 0; i < fileList.length; i++) {
	var fileStat = fs.lstatSync(fileList[i]);
	var path = Path.parse(fileList[i]);
	
	if (fileStat.isDirectory()) {
		var subdirList = fs.readdirSync(fileList[i]);
		if (subdirList.length === 0) {
			fileList.splice(i,1);
			i--;
		} else {
    		subdirList = fullPaths(subdirList, fileList[i]);
    		var flag = false;
    		
    		// Check one level deep if there are subdirectories or md files
    		// TODO: Modify this to check further subdirectories.
    		for (var j = 0; j < subdirList.length; j++) {
    			if (fs.lstatSync(subdirList[j]).isDirectory()) {
    				flag = true;
    			} else if (Path.parse(subdirList[j]).ext === '.md') {
    				flag = true;
    			}
    		}
    		
    		if (flag) {
    			fileList = fileList.concat(subdirList);
            	fileListTypes.push('dir');
    		} else {
    			fileList.splice(i,1);
    			i--;
    		}
    	}
	} else if (fileStat.isFile()) {
		if (path.ext === '.md') {
			fileListTypes.push('file');
		} else {
			fileList.splice(i,1);
			i--;
		}
	}
}

// Extract directories and md files
var dirList = fileList.filter(function(file) { 
	return fs.lstatSync(file).isDirectory(); 
	});
var mdList = fileList.filter(function(file) { 
	return fs.lstatSync(file).isFile(); 
});

if(mdList.length === 0) {
	console.log('No markdown files to upload. Exiting...');
	process.exit();
}

// Initialize dir objects
var tempIdCounter = 1;
for (var i = 0; i < dirList.length; i++) {
	dirList[i] = {path: dirList[i], tempId: tempIdCounter, Id: undefined, parentId: -1};
	tempIdCounter++;
}

// Populate the dir and md objects with the temporary parent Ids.
for (var i = 0; i < dirList.length; i++) {

	var parentPath = Path.dirname(dirList[i].path);
	for (var j = 0; j < i; j++) {
		if (parentPath === dirList[j].path) {
			dirList[i].parentId = dirList[j].tempId;
			break;
		}
	}
	if (dirList[i].parentId === -1) {
		dirList[i].parentId = 0;
	}
}

for (var i = 0; i < mdList.length; i++) {
	mdList[i] = {path: mdList[i], parentId: -1};
	var parentPath = Path.dirname(mdList[i].path)
	for (var j = 0; j < dirList.length; j++) {
		if (parentPath === dirList[j].path) {
			mdList[i].parentId = dirList[j].tempId;
			break;
		}
	}
	if (mdList[i].parentId === -1) {
		mdList[i].parentId = 0;
	}
}

postRootItem(parentId, rootName, beginUpload);

function beginUpload(item) {
	rootId = item.id;
	
	// Give root level directories the correct parent id.
	for (var i = 0; i < dirList.length; i++) {
		if(dirList[i].parentId === 0) {
			dirList[i].parentId = rootId;
		}
	}
	
	console.log('Creating ' + dirList.length + ' directory items...');
	postDirItem(0);
}

// Posts the root item.
function postRootItem(pId, name, callback) {
	var dirItem = {name: name, description: '', parentId: pId};
	var options = {
			host: 'localhost',
			port: 3000,
			path: '/api/Items/',
			method: 'POST',
			headers: {
				'Authorization': accessToken,
				'Content-Type': 'application/json;charset=UTF-8',
				'Content-Length': Buffer.byteLength(JSON.stringify(dirItem))
			}
	};
	
	var putRequest = http.request(options, function(response) {
		console.log('Root Item POST status ' + response.statusCode);
		if (response.statusCode !== 200) {
			console.log('Unexpected status. Exiting...');
			process.exit();
		}
		var output = '';
		response.on('data', function (chunk) {
			output += chunk;
		});
		response.on('end', function() {
			output = JSON.parse(output);
			callback(output);
		});
	});

	putRequest.write(JSON.stringify(dirItem));
	putRequest.end();
}

// Recursively posts directory items.
function postDirItem(index) {
	if(index >= dirList.length) {
		console.log('Done POSTing directories...');
		
		// Add correct parent Ids to md items
		for (var i = 0; i < mdList.length; i++) {
			if(mdList[i].parentId === 0) {
				mdList[i].parentId = rootId;
			} else {
				var parentPath = Path.dirname(mdList[i].path)
				for (var j = 0; j < dirList.length; j++) {
					if (parentPath === dirList[j].path) {
						mdList[i].parentId = dirList[j].id;
						break;
					}
				}
			}
		}
		console.log(mdList);
		console.log('Now starting markdown upload.');
		uploadMarkdown(0);
		return;
	}
	var dir = dirList[index];
	
	// Resolve dir's parent, if not root
	if (dir.parentId !== rootId) {
		for (var i = 0; i < index; i++) {
			if (dir.parentId === dirList[i].tempId) {
				dir.parentId = dirList[i].id;
			}
		}
	}
	
	dirItem = {name: Path.basename(dir.path), description: 'Directory', parentId: dir.parentId};
	var options = {
			host: 'localhost',
			port: 3000,
			path: '/api/Items/',
			method: 'POST',
			headers: {
				'Authorization': accessToken,
				'Content-Type': 'application/json;charset=UTF-8',
				'Content-Length': Buffer.byteLength(JSON.stringify(dirItem))
			}
	};
	
	var putRequest = http.request(options, function(response) {
		console.log('Dir Item POST status ' + response.statusCode);
		if (response.statusCode !== 200) {
			console.log('Unexpected status. Exiting...');
			process.exit();
		}
		var output = '';
		response.on('data', function (chunk) {
			output += chunk;
		});
		response.on('end', function() {
			output = JSON.parse(output);
			dirList[index].id = output.id;
			postDirItem(index + 1);
		});
	});

	putRequest.write(JSON.stringify(dirItem));
	putRequest.end();
}

function uploadMarkdown(index) {
	if (index >= mdList.length) {
		console.log('::: All markdown uploads queued. Waiting for it to finish');
		return;
	}
	
	var md = mdList[index];
	var mdRoot = {name: Path.basename(md.path), parentId: md.parentId, description: 'File', itemIds: []}
	console.log('Uploading ' + md.path);
	mdToKohese(md.path, mdRoot);
	uploadMarkdown(index + 1);
}

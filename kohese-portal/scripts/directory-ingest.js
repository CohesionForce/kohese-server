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

//Begin Argument Processing
if (process.argv[2]) {
	basePath = Path.normalize(process.argv[2] + Path.sep);
	if(!Path.isAbsolute(basePath)) {
		console.log('Please provide an absolute path.');
		process.exit();
	}
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
//End Argument Processing

//Start parsing the directory list to obtain all subdirectories and contained files.
try {
	var fileList = fs.readdirSync(basePath);
} catch (err) {
	console.log('An error occured while reading the given directory.');
	console.log(err);
	process.exit();
}

var tempDir = '/tmp-' + Math.floor((Math.random() * 10000) + 1);
var tempDirPath = Path.join(basePath,tempDir);
try {
	fs.mkdirSync(tempDirPath);
} catch(err) {
	console.log('An error occured while creating the temp directory');
	console.log(err);
}

if (fileList.length === 0) {
	console.log('!!! The given directory does not contain any files.');
	process.exit();
}

var accessToken;
try { 
	accessToken = fs.readFileSync('./scripts/token.jwt');
} catch(err) {
	console.log('Error reading token file. Please run "node scripts/login.js"');
	process.exit();
}

//Add the basePath to the file list to get proper paths
function fullPaths(list, path) {
	for (var i = 0; i < list.length; i++) {
		list[i] = Path.join(path, list[i]);
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

//Convert paths to be to the temp directory and re-create the directory structure
var tempFileList = [];
for (var i = 0; i < fileList.length; i++) {
	tempFileList.push(tempDirPath + '/' + splitPath(fileList[i], basePath));
	if (fileListTypes[i] === 'dir') {
		fs.mkdirSync(tempFileList[i]);
	}
}

//Functions returns the part of the given filePath after the base.
// TODO: Remove the use of split to allow for directories which contain themselves.
function splitPath(filePath, base) {
	var temp = filePath.split(base);
	if (temp.length !== 2) {
		console.log('!!! Error: Splitting the path has produced too many entries.');
		console.log(temp);
		process.exit();
	}
	return temp[1];
}

//Process files to MD if possible
console.log('Starting processing of ' + fileList.length + ' entities');
var count = 0;
for (var i = 0; i < fileList.length; i++) {
	if (fileListTypes[i] === 'file') {
		var ext = Path.extname(fileList[i]);
		processToMarkdown(fileList[i], tempFileList[i]);
		count++;
	}
}
console.log('Processed ' + count + ' files');

function processToMarkdown(filePath, tempFilePath) {

	var path = Path.parse(splitPath(filePath, basePath));

	var pathDirBase = Path.join(path.dir, path.base);
	var tempPathDirName = Path.join(tempDir, path.dir, path.name);
	var mdOutPath = Path.join(basePath, tempPathDirName + '.md');

	switch (path.ext) {
	case '.doc':
		// doc processing
		console.log('::: Processing doc to odt to md');
		var soffice = child.spawnSync('soffice', ['--headless', '--convert-to', 'odt', pathDirBase, '--outdir', Path.join(basePath, tempDir, path.dir) ], { cwd: basePath, encoding : 'utf8' });
		if(soffice.stdout) {
			console.log(soffice.stdout);
		}
		var pandoc = child.spawnSync('pandoc', ['-f', 'odt', '-t', 'markdown', '--atx-headers', Path.join(basePath, tempPathDirName, '.odt'), '-o', mdOutPath], { cwd: basePath, encoding : 'utf8' });
		if(pandoc.stdout) {
			console.log(pandoc.stdout);
		}
		break;
	case '.odt':
		// odt processing
		console.log('::: Processing odt to md');
		var pandoc = child.spawnSync('pandoc', ['-f', 'odt', '-t', 'markdown', '--atx-headers', pathDirBase, '-o', mdOutPath], { cwd: basePath, encoding : 'utf8' });
		if(pandoc.stdout) {
			console.log(pandoc.stdout);
		}
		break;
	case '.docx':
		// docx processing
		console.log('::: Processing docx to md');
		var pandoc = child.spawnSync('pandoc', ['-f', 'docx', '-t', 'markdown', '--atx-headers', pathDirBase, '-o', mdOutPath], { cwd: basePath, encoding : 'utf8' });
		if(pandoc.stdout) {
			console.log(pandoc.stdout);
		}
		break;
	case '.htm':
	case '.html':
		// html processing
		console.log('::: Processing html to md');
		var pandoc = child.spawnSync('pandoc', ['-f', 'html', '-t', 'markdown', '--atx-headers', pathDirBase, '-o', mdOutPath], { cwd: basePath, encoding : 'utf8' });
		if(pandoc.stdout) {
			console.log(pandoc.stdout);
		}
		break;
	case '.md':
		// No Processing needed, but do need to copy
		console.log('::: Copying exisiting md file');
		var cpy = child.spawnSync('cp', [pathDirBase, mdOutPath], { cwd: basePath, encoding : 'utf8' });
		break;
	default:
		console.log('!!! Unhandled extension: ' + path.ext + ' in ' + filePath);
	}

	console.log('Done processing file ' + path.base);
}

//Now parse the temp directory structure but only store directories and markdown files.
fileList = fs.readdirSync(tempDirPath);
fileList = fullPaths(fileList, tempDirPath);
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

//Extract directories and md files from the file list
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

//Initialize dir objects
var tempIdCounter = 1;
for (var i = 0; i < dirList.length; i++) {
	dirList[i] = {path: dirList[i], 
			tempId: tempIdCounter, 
			Id: undefined, 
			parentId: -1};
	tempIdCounter++;
}

//Populate the dir and md objects with the temporary parent Ids.
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
	process.on('exit', exitHandler.bind(null,{cleanup:true}));
}

function exitHandler(options, err) {
	console.log('All operations are completed. Now cleaning up...');
	var delList = [];
	delList = fs.readdirSync(tempDirPath);
	delList = fullPaths(delList, tempDirPath);

	var delListTypes = [];
	for (var i = 0; i < delList.length; i++) {
		var fileStat = fs.lstatSync(delList[i]);
		if (fileStat.isDirectory()) {
			var subdirList = fs.readdirSync(delList[i]);
			delListTypes.push('dir');
			subdirList = fullPaths(subdirList, delList[i]);
			delList = delList.concat(subdirList);
		} else if (fileStat.isFile()) {
			delListTypes.push('file');
		} else {
			delListTypes.push('other');
			console.log('!!! Warning: ' + delList[i] + ' is not a file or directory.');
		}
	}

	while (delList.length > 0) {
		var toDelete = delList.pop();
		var type = delListTypes.pop();
		if (type === 'file') {
			fs.unlinkSync(toDelete);
		} else if (type === 'dir') {
			fs.rmdirSync(toDelete);
		} 
	}
	fs.rmdirSync(tempDirPath);
	
	console.log('Clean up done!');
}

//Posts the root item.
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
			return;
		});
	});

	putRequest.write(JSON.stringify(dirItem));
	putRequest.end();
}

//Recursively posts directory items.
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
		//console.log(mdList);
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
//	console.log('Uploading ' + md.path);
//	mdToKohese(md.path, mdRoot)
//	uploadMarkdown(index + 1);
	
	// Space out the server calls a bit in ms
	setTimeout(function() {
		console.log('Uploading ' + md.path);
		mdToKohese(md.path, mdRoot)
		uploadMarkdown(index + 1);
	}, 250);
}

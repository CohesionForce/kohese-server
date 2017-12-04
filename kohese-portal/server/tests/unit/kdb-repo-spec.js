const KdbRepo = require('./../../kdb-repo.js');
const Fs = require('fs');
const Path = require('path');

var repositoryId = 'repository';
var repositoryPath = repositoryId;
var testUUID = '77777777-7777-1777-a777-777777777777';
var testFile = testUUID + '.json';
var baseContent = 'base';
var additionalContent = '-additonal';
var furtherContent = '-further';

describe('Test Repository functionality', function () {
  if (Fs.existsSync(repositoryPath)) {
    descend(repositoryPath, function (location, isDirectory) {
      if (isDirectory) {
        Fs.rmdirSync(location);
      } else {
        Fs.unlinkSync(location);
      }
    });
  }
  
  it('performs Repository initialization', function (done) {
    if (!Fs.existsSync(repositoryPath)) {
      Fs.mkdirSync(repositoryPath);
    }
    
    KdbRepo.initializeRepository(repositoryId, repositoryPath).then(function () {
      expect(Fs.readdirSync(repositoryPath).indexOf('.git')).not.toEqual(-1);
      done();
    }).catch(function (err) {
      fail();
      console.log(err.stack);
    });
  });

  it('retrieves status for a new file added to the working tree', function () {
    Fs.writeFileSync(repositoryPath + Path.sep + testFile, baseContent);
    var status = KdbRepo.getItemStatus(repositoryId, testFile);
    expect(status).toEqual(['WT_NEW']);
  });
  
  it('adds to the index', function (done) {
    KdbRepo.add(repositoryId, testFile).then(function (addStatus) {
      expect(addStatus).toBeTruthy();
      done();
    }).catch(function (err) {
      fail();
      console.log(err.stack);
    });
  });

  it('retrieves status for a new file added to the index', function () {
    var status = KdbRepo.getItemStatus(repositoryId, testFile);
    expect(status).toEqual(['INDEX_NEW']);
  });
  
  it('commits', function (done) {
    KdbRepo.commit([repositoryId], 'name', 'e-mail', 'message').then(function (commitIdMap) {
      expect(commitIdMap.repository.filesCommitted).toEqual([testFile]);
      expect(commitIdMap[repositoryId]).toBeDefined();
      done();
    }).catch(function (err) {
      fail();
      console.log(err.stack);
    });
  });

  it('adds a remote', function (done) {
    var remoteName = 'name';
    KdbRepo.addRemote(repositoryId, remoteName, 'url').then(function (name) {
      expect(name).toEqual(remoteName);
      done();
    }).catch(function (err) {
      fail();
      console.log(err.stack);
    });
  });

  it('lists remotes', function (done) {
    KdbRepo.getRemotes(repositoryId).then(function (remotes) {
      expect(remotes).toEqual([ 'name' ]);
      done();
    }).catch(function (err) {
      fail();
      console.log(err.stack);
    });
  });

  xit('pushes', function (done) {
    KdbRepo.push(repositoryId, 'name', 'radmin').then(function (pushStatusMap) {
      expect(pushStatusMap[repositoryId]).toBeDefined();
      done();
    }).catch(function (err) {
      fail();
      console.log(err.stack);
    });
  });

  it('performs a checkout of a commited file with modifications', function (done) {
    Fs.writeFileSync(repositoryPath + Path.sep + testFile, baseContent +
      additionalContent);
    KdbRepo.checkout(repositoryId, [testFile], true).then(function () {
      var status = KdbRepo.getItemStatus(repositoryId, testFile);
      expect(status).toEqual([]);
      done();
    }).catch(function (err) {
      fail();
      console.log(err.stack);
    });
  });
  
  it('resets', function (done) {
    Fs.writeFileSync(repositoryPath + Path.sep + testFile, baseContent +
      additionalContent);
    KdbRepo.add(repositoryId, testFile).then(function () {
      return KdbRepo.reset(repositoryId, [testFile]);
    }).then(function () {
      var s = KdbRepo.getItemStatus(repositoryId, testFile);
      expect(s).toContain('WT_MODIFIED');
      done();
    }).catch(function (err) {
      fail();
      console.log(err.stack);
    });
  });
  
  it('does not checkout a tracked file that has been added to the index', function (done) {
    KdbRepo.add(repositoryId, testFile).then(function (addStatus) {
      if (addStatus) {
        KdbRepo.checkout(repositoryId, [testFile], true).then(function () {
          expect(Fs.readFileSync(repositoryPath + Path.sep + testFile,
            {encoding: 'utf8', flag: 'r'})).toEqual(baseContent + additionalContent);
          var status = KdbRepo.getItemStatus(repositoryId, testFile);
          expect(status).toEqual(['INDEX_MODIFIED']);
          done();
        });
      } else {
        fail();
      }
    });
  });

  it('reverts an indexed and further modified file to the indexed state', function (done) {
    var originalContent = Fs.readFileSync(repositoryPath + Path.sep + testFile,
        {encoding: 'utf8', flag: 'r'});

    var status = KdbRepo.getItemStatus(repositoryId, testFile);
    expect(status).toEqual(['INDEX_MODIFIED']);
    
    Fs.writeFileSync(repositoryPath + Path.sep + testFile, originalContent + furtherContent);
    status = KdbRepo.getItemStatus(repositoryId, testFile);
    expect(status).toEqual(['INDEX_MODIFIED', 'WT_MODIFIED']);

    KdbRepo.checkout(repositoryId, [testFile], true).then(function () {
      status = KdbRepo.getItemStatus(repositoryId, testFile);
      expect(status).toEqual(['INDEX_MODIFIED']);
      expect(Fs.readFileSync(repositoryPath + Path.sep + testFile,
          {encoding: 'utf8', flag: 'r'})).toEqual(originalContent);
      done();
    });
  });

  it('retrieves Repository status', function (done) {
    KdbRepo.getStatus(repositoryId, function (repoStatus) {
      expect(repoStatus).toEqual([{ id : testUUID, status : ['INDEX_MODIFIED']}]);
      done();
    });
  });

  it('retrieves status for a working tree change', function (done) {
    KdbRepo.commit([repositoryId], 'name', 'e-mail', 'message').then(function (commitIdMap) {
      Fs.writeFileSync(repositoryPath + Path.sep + testFile, baseContent +
          additionalContent +
          'third');
      var status = KdbRepo.getItemStatus(repositoryId, testFile);
      expect(status).toEqual(['WT_MODIFIED']);
      done();
    }).catch(function (err) {
      fail();
      console.log(err.stack);
    });
  });
});

function descend(location, callback) {
  var stat = Fs.statSync(location);
  if (stat.isDirectory()) {
    var contents = Fs.readdirSync(location);
    for (var j = 0; j < contents.length; j++) {
      descend(Path.join(location, contents[j]), callback);
    }
    callback(location, true);
  } else {
    callback(location, false);
  }
}

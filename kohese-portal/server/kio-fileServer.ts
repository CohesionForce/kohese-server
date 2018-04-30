/**
 *
 */

// eslint-disable-next-line no-unused-vars
var kio = require('./koheseIO.js');
var SocketIOFile = require('socket.io-file');

global['app'].on('newSession', function (socket) {

  console.log('>>> KIO File Server: session %s connected from %s for %s',
      socket.id, socket.handshake.address, socket.koheseUser.username);

  var uploader = new SocketIOFile(socket, {
    uploadDir: 'data_import/' + socket.koheseUser.username,
    accepts: [
      'application/vnd.oasis.opendocument.text',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/pdf'],
    maxFileSize: 20000000,
    chunkSize: 10240,
    transmissionDelay: 0,
    overwrite: true
  });

  uploader.on('start', (fileInfo) => {
    console.log('::: session %s: Received File/Upload for %s for user %s at %s',
        socket.id, fileInfo.name, socket.koheseUser.username, socket.handshake.address);
    console.log('::: File: Start uploading');
    console.log(fileInfo);
  });

  uploader.on('stream', (fileInfo) => {
    console.log(':::  File:' +`${fileInfo.wrote} / ${fileInfo.size} byte(s)`);
  });

  uploader.on('complete', (fileInfo) => {
    console.log('::: File: Upload Complete.');
    console.log(fileInfo);
  });

  uploader.on('error', (err) => {
    console.log('::: File: Error!', err);
  });

  uploader.on('abort', (fileInfo) => {
    console.log('::: File: Aborted: ', fileInfo);
  });


});

/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 *
 */

// eslint-disable-next-line no-unused-vars
var kio = require('./koheseIO');
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
      'application/pdf',
      'text/markdown',
      'text/x-markdown',
      'image/png',
      'image/jpeg'],
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

/*
 * Copyright (c) 2021 CohesionForce inc. | www.CohesionForce.com | info@CohesionForce.com
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
 *  Create a remote REPL interface accessible via scripts/remoteConnect.js
 *
 *  Note: This is only used if the server is started with a 'repl' argument
 */

var repl = require('repl');
var net = require('net');
var util = require('util');
var kio = require('./koheseIO');

console.log('::: Starting Remote REPL Interface');
var replServer = net.createServer(function(socket) {

    socket.on('error', function(err) {
        console.log(err);
    });

    console.log('::: User ' + socket.remoteAddress + ' connected to REPL Server');

    var replConsole = repl.start({
        prompt: 'Kohese Server Remote > ',
        input: socket,
        output: socket
    });

    replConsole.outputStream.write('\nType \'.help\' for commands. \n');
    replConsole.outputStream.write('Note: All commands must be prefaced with \'.\'\n');
    replConsole.displayPrompt();

    replConsole.on('exit', function() {
        console.log('::: User ' + socket.remoteAddress + ' disconnected');
        socket.end();
    });
    replConsole.on('error', function(err) {
        replConsole.outputStream.write(err);
    });

    defineCommands(replConsole);
});

replServer.on('error', function(err) {
    console.log(err);
});


replServer.listen(5001, function() {
    console.log('::: Remote REPL listening at locahost:5001');
});

function defineCommands(replConsole) {
    replConsole.defineCommand('crash', {
        help: 'crash the server. Why?',
        action: function() {
            this.outputStream.write(kio.sessions);
            this.displayPrompt();
        }
    });

    replConsole.defineCommand('sessions', {
        help: 'Print list of active client sessions.',
        action: function() {
            this.outputStream.write(util.inspect(kio.sessions) + '\n');
            this.displayPrompt();
        }
    });

    replConsole.defineCommand('getKDBPath', {
        help: 'Print the current KDB Path',
        action: function() {
            var kdbPath = global['koheseKDB'].ItemProxy.getWorkingTree().getRootProxy().repoPath;
            this.outputStream.write(kdbPath + '\n');
            this.displayPrompt();
        }
    });

    replConsole.defineCommand('restart', {
        help: 'restarts the server in a terrible way',
        action: function() {
            var child = require('child_process');
            var kdbPath = global['koheseKDB'].ItemProxy.getWorkingTree().getRootProxy().repoPath;
            kdbPath = kdbPath.replace(/\/Root.json$/,'');
            kdbPath = kdbPath.replace(/^kdb\//, '');
            child.spawn('gnome-terminal',
                ['-e', 'node . -kdb=' + kdbPath + ' repl', '--title', 'Kohese Server : ' + kdbPath],
                {detached: true});
            process.exit();
            // If the current process exits before spawning a new one may need to do:
            // setTimeout(function() {process.exit()} , 100)
            // This gives a 100ms delay for calling the exit.
        }
    });
}

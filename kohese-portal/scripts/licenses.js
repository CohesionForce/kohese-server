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
 *  Checks all licenses via license-checker
 *  Uses a user interactive prompt unless given with command-line arguments:
 *  node scripts/licenses.js list
 *  node scripts/licenses.js license <licenseName>
 *  node scripts/licenses.js module <moduleName>
 *  node scripts/licenses.js bower list/license/module
 */
const spawn = require('child_process').spawn;
const nlc = require('license-checker');
const nlcProd = require('license-checker');
const prompt = require('prompt');
prompt.start();

//Begin Menus for Prompt

const mainMenu = {properties: {option: {
    description: '[L]ist Licenses; \n[G]et Modules from License; \nGet [M]odule info; \n[C]hange mode; \nGet [N]ode Dependency by package; \nE[x]it',
    pattern: /^[CcGgLlMmNnXx]{1}$/,
    message: 'Invalid input.',
    required: true
}}};

const getModulePrompt = {properties: {license: {
    description: 'Enter license entry as shown in the license list:',
    required: true}}};

const getModuleInfoPrompt = {properties: {module: {
    description: 'Enter name of module:',
    required: true}}};

const depPrompt = {properties: {module: {
    description: 'Enter exact name of module in the form name or name@version:',
    required: true}}};

//End Menus

var notInteractive = false;
if(process.argv.length > 2) {
    console.log('Running non-interactively...');
    notInteractive = true;
}

var npmList = {};
var licenseStore = {};

var loadData = new Promise(function(resolve, reject) {
    console.log('Initializing data...');

    var nlcProdPromise = new Promise(function(resolve, reject) {
        nlcProd.init({start: __dirname + '/..', production: true}, function(err, node) {
            if(err) {
                console.log(err);
                process.exit();
            }
            console.log('nodeProduction licenses data loaded.');
            licenseStore['nodeProduction'] = node;
            resolve();
        });
    });

    var nlcPromise = new Promise(function(resolve, reject) {
        nlc.init({start: __dirname + '/..'}, function(err, node) {
            if(err) {
                console.log(err);
                process.exit();
            }
            console.log('Node licenses data loaded.');
            licenseStore['node'] = node;
            resolve();
        });
    });

    var npmPromise = new Promise(function(resolve, reject) {
        var npmls = spawn('npm', ['ls', '-json']);
        var data = '';
        npmls.stdout.on('data', function(chunk) {
            data += chunk;
        });
        npmls.on('close', function() {
            console.log('npm ls done');
            npmList['node'] = JSON.parse(data);
            resolve();
        })
    });

    var npmProdPromise = new Promise(function(resolve, reject) {
        var npmls = spawn('npm', ['ls', '-prod', '-json']);
        var data = '';
        npmls.stdout.on('data', function(chunk) {
            data += chunk;
        });
        npmls.on('close', function() {
            console.log('npm ls prod done');
            npmList['nodeProduction'] = JSON.parse(data);
            resolve();
        })
    });

    Promise.all([nlcPromise, nlcProdPromise, npmPromise, npmProdPromise]).then(function() {
        resolve();
    });
});

loadData.then(function() {
    var mode = 'node';
    var json = licenseStore[mode];
    console.log('List initialized.');

    /* Format of json for licenseStore[mode]:
     *   ...
     *   name@version: {
     *       licenses: ,
     *       repository: ,
     *       publisher: ,
     *       email: ,
     *       licenseFile: ,
     *   }
     *   ...
     */

    var licensesList = {};
    var counter = {};

    function processJSON() {
        licensesList = {};
        counter = {};
        for(var module in json) {
            var moduleLicense = json[module].licenses;
            if(!licensesList.hasOwnProperty(moduleLicense)) {
                licensesList[moduleLicense] = {};
                counter[moduleLicense] = 0;
            }
            licensesList[moduleLicense][module] = json[module];
            counter[moduleLicense]++;
        }
    }
    processJSON();

    if(notInteractive) {
        runNotInteractive();
    }

    // Register 'beforeExit' event so you dont need makeMenu() after every menu function.
    process.on('beforeExit', function() {
        makeMenu();
    });

    makeMenu();

    function makeMenu() {
        if(notInteractive){
            process.exit();
        }
        console.log('Current Mode: ' + mode);
        prompt.get(mainMenu, function(err, result) {
            if(result.option === 'l' || result.option === 'L') {
                listLicenses();
            }
            if(result.option === 'g' || result.option === 'G') {
                prompt.get(getModulePrompt, function(err, result) {
                    getModulesFromLicense(result.license);
                });
            }
            if(result.option === 'm' || result.option === 'M') {
                prompt.get(getModuleInfoPrompt, function(err, result) {
                    getModuleInfo(result.module);
                })
            }
            if(result.option === 'c' || result.option === 'C') {
                if(mode === 'node') {
                    mode = 'nodeProduction';
                } else if(mode === 'nodeProduction') {
                    mode = 'bower';
                } else if(mode === 'bower') {
                    mode = 'node';
                } else {
                    console.log('Invalid mode.');
                    process.exit();
                }
                console.log('Changing mode to ' + mode);
                json = licenseStore[mode];
                processJSON();
            }
            if(result.option === 'n' || result.option === 'N') {
                if(mode === 'bower') {
                    console.log('bower is not supported with this option');
                    return;
                }
                prompt.get(depPrompt, function(err, result) {
                    getDepInfo(result.module);
                })
            }
            if(result.option === 'x' || result.option === 'X') {
                console.log('Exiting...')
                process.exit();
            }

        });
    }

    function listLicenses() {
        var sorted = Object.keys(licensesList).sort(function (a,b) {
            if(a.toLowerCase() <= b.toLowerCase())
                return -1;
            else
                return 1;
        });
        for(var i = 0; i < sorted.length; i++) {
            console.log(counter[sorted[i]] + '\t' + sorted[i]);
        }
    }

    function getModulesFromLicense(license) {
        var matched = false;
        for(var key in licensesList) {
            if(key.toLowerCase().includes(license.toLowerCase())) {
                matched = true;
                console.log(JSON.stringify(licensesList[key], null, 4));
            }
        }
        if(!matched) {
            console.log('No match found.');
        }
    }

    function getModuleInfo(module) {
        var matched = false;
        for(var key in json) {
            if(key.toLowerCase().includes(module.toLowerCase())) {
                matched = true;
                console.log(key);
                console.log(JSON.stringify(json[key], null, 4));
            }
        }
        if(!matched) {
            console.log('No match found.');
        }
    }

    function getDepInfo(module) {
        if(mode === 'bower') {
            console.log('mode bower not supported');
            return;
        }
        var moduleChain = getChain(module);
        printModuleChain(moduleChain);

        function getChain(module) {
            // module should have form name@version
            // npm json is keyed by name with name.version as the version.
            var versionProvided;
            var name;
            var version;
            var split = module.split('@');
            if(split.length === 1) {
                versionProvided = false;
                name = split[0];
            } else {
                name = module.split('@')[0];
                version = module.split('@')[1];
                versionProvided = true;
            }

            var parentChain = [];
            var parentChainIdx = 0;
            var chain = [];

            buildChain(npmList[mode]);
            return parentChain;

            function buildChain(parent) {
                var deps = parent.dependencies;
                if(!deps) {
                    chain.pop();
                    return;
                }
                for(var key in deps) {
                    deps[key].name = key + '@' + deps[key].version;
                    chain.push(deps[key]);
                    if(name === key && versionProvided && version === deps[key].version) {
                        // chain is being assigned to an element of parentChain as a reference
                        // without the slice. This causes a brand new array to be made, apparently.
                        parentChain[parentChainIdx] = chain.slice(0);
                        parentChainIdx++;
                        chain.pop();
                    } else if(!versionProvided && name === key) {
                        parentChain[parentChainIdx] = chain.slice(0);
                        parentChainIdx++;
                        chain.pop();
                    } else {
                        buildChain(deps[key]);
                    }
                }
                chain.pop();
            }
        }

        function printModuleChain(moduleChain) {
            if(moduleChain.length === 0) {
                console.log('No matches found.');
                console.log('If you expected matches but found none, then the package may be extraneous.');
                console.log("Run 'npm prune' to clear all extraneous packages.")
                return;
            }
            for(var i = 0; i < moduleChain.length; i++) {
                var chain = moduleChain[i];
                var output = '';
                for(var j = 0; j < chain.length; j++) {
                    if(j !== 0 ) {
                        output += ' ->';
                    }
                    output += ' ' + chain[j].name;
                }
                console.log((i+1) + '. ' + output + '\n');
            }

        }
    }

    function runNotInteractive() {
        var offset = 0;
        if(process.argv[2] === 'bower') {
            console.log('Changing mode to bower');
            json = licenseStore.bower;
            processJSON();
            offset = 1;
        }
        var option = process.argv[2+offset];
        if (option === 'list') {
            listLicenses();
        }
        else if(option === 'license') {
            getModulesFromLicense(process.argv[3+offset]);
        }
        else if(option === 'module') {
            getModuleInfo(process.argv[3+offset]);
        }
        else {
            console.log('Usage: \n*  node scripts/licenses.js list\n*  node scripts/licenses.js license <licenseName>\n*  node scripts/licenses.js module <moduleName>\n*  node scripts/licenses.js bower list/license/module');
        }
        process.exit();
    }
});

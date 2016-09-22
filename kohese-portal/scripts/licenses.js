/**
 *  Checks all licenses via license-checker
 *  Uses a user interative prompt unless given with commandline arguments:
 *  node scripts/licenses.js list
 *  node scripts/licenses.js license <licenseName>
 *  node scripts/licenses.js module <moduleName>
 *  node scripts/licenses.js bower list/license/module
 */
const spawn = require('child_process').spawn;
const nlc = require('license-checker');
const blc = require('bower-license');
const prompt = require('prompt');
prompt.start();

//Begin Menus for Prompt

const mainMenu = {properties: {option: {
    description: '[L]ist Licenses; \n[G]et Modules from License; \nGet [M]odule info; \n[C]hange mode; \nE[x]it',
    pattern: /^[cCLlGgXxMm]{1}$/, 
    message: 'Invalid input.',
    required: true
}}};

const getModulePrompt = {properties: {license: {
    description: 'Enter license entry as shown in the license list:',
    required: true}}};

const getModuleInfoPrompt = {properties: {module: {
    description: 'Enter name of module:',
    required: true}}};

//End Menus

var notInteractive = false;
if(process.argv.length > 2) {
    console.log('Running non-interactively...');
    notInteractive = true;
}

var npmList;
var licenseStore = {};

var loadData = new Promise(function(resolve, reject) {
    console.log('Initializing data...');

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

    var blcPromise = new Promise(function(resolve, reject) {
        blc.init({start: __dirname + '/..'}, function(bower, err) {
            if(err) {
                console.log(err);
                process.exit();
            }
            licenseStore['bower'] = bower;
            console.log('bower licenses loaded');
            resolve();
        });
    });
    
    var npmPromise = new Promise(function(resolve, reject) {
        var npmls = spawn('npm', ['ls', '-json']);
        var data = '';
        npmls.stdout.on('data', function(chunk) {
            data += chunk;
        });
//        npmls.stderr.on('data', function(chunk) {
//            console.error(chunk.toString('utf8'));
//        });
        npmls.on('close', function() {
            console.log('npm ls done');
            npmList = JSON.parse(data);
            resolve();
        })
    });
    
    Promise.all([nlcPromise, blcPromise, npmPromise]).then(function() {
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
    makeMenu();

    function makeMenu() {
        if(notInteractive){
            process.exit();
        }
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
                makeMenu();
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
        makeMenu();
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
        makeMenu();
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
        makeMenu();
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
    }
});
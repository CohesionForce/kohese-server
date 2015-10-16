module.exports = function(Analysis) {
  
  var http = require('http');
  var util = require('util');
  var _und = require('../../node_modules/underscore/underscore.js');

  function requestAnalysisJSON (req, onId, cb){
    console.log('::: ANALYZING2: ' + onId);

    var requestData = {
        name: "test data",
        description: "the quick brown fox (js) jumped over the slow java coder"
    };
    
    var options = {
        host: "localhost",
        port: 9091,
        path: '/services/analysis/' + onId,
        method: 'POST',
        json: requestData
    };
    
    // console.log('OPTIONS: ' + JSON.stringify(options));
    http.request(options, function (res) {
        var response = "";
        // console.log('STATUS: ' + res.statusCode);
        // console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
                    
        res.on('data', function (chunk) {

            // console.log('::: BODY: ' /* + chunk*/);
            response += chunk.toString();

        });
        res.on('end', function () {
            var analysis = new Analysis;
            analysis.id = onId + "-new";
            try {
                analysis.raw = JSON.parse(response);
//                Analysis.consolidateAnalysis(analysis);
                // delete the raw data
//                analysis.raw = {};
                analysis.save();
                console.log('::: ANALYSIS2 Completed: ' + onId);
            }
            catch (err) {
                console.log("*** Error parsing result for: " + onId);
                console.log("Analysis response:  >>>" + response + "<<<");
                console.log(err);
            }

            cb(null, analysis);
        });
    }).on('error', function (err){
      error = new Error('*** Failure while communicating with Analysis server');
      error.http_code = 504;
      error.code = err.code;
      error.syscall = err.syscall;
      console.log(error);
      cb(error,null);
    }).end();          
  }
  
  function requestAnalysis (req, onId, cb) {
    console.log('::: ANALYZING: ' + onId);

    var options = {
        host: "localhost",
        port: 9091,
        path: '/services/analysis/' + onId,
        method: 'GET',
        headers: {'authorization': req.headers.authorization}
    };
    
    // console.log('OPTIONS: ' + JSON.stringify(options));
    http.request(options, function (res) {
        var response = "";
        // console.log('STATUS: ' + res.statusCode);
        // console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
                    
        res.on('data', function (chunk) {

            // console.log('::: BODY: ' /* + chunk*/);
            response += chunk.toString();

        });
        res.on('end', function () {
            var analysis = new Analysis;
            analysis.id = onId;
            try {
                analysis.raw = JSON.parse(response);
                Analysis.consolidateAnalysis(analysis);
                // delete the raw data
                analysis.raw = {};
                analysis.save();
                console.log('::: ANALYSIS Completed: ' + onId);
            }
            catch (err) {
                console.log("*** Error parsing result for: " + onId);
                console.log("Analysis response:  >>>" + response + "<<<");
                console.log(err);
            }

            cb(null, analysis);
        });
    }).on('error', function (err){
      error = new Error('*** Failure while communicating with Analysis server');
      error.http_code = 504;
      error.code = err.code;
      error.syscall = err.syscall;
      console.log(error);
      cb(error,null);
    }).end();      
  }
  
  Analysis.performAnalysis = function (req, forModelKind, onId, cb) {
      console.log("::: Preparing to analyze " + forModelKind + " " + onId);
      Analysis.findById(onId, function(err, analysis) {
        
        if (analysis){
          cb (null, analysis);
        } else {
          requestAnalysis (req,onId, cb);
        }      
      });

  }

  Analysis.remoteMethod('performAnalysis', {
      accepts: [
         {arg: 'req', type: 'object', 'http': {source: 'req'}},
         {arg: 'forModelKind', type: 'string'},
         {arg: 'onId', type: 'string'}
      ],
      returns: {
          arg: 'data',
          type: 'object'
      }
  });

  Analysis.afterRemoteError('performAnalysis', function( ctx, next) { 
    ctx.res.status(ctx.error.http_code).end(ctx.error.message);
   });
  
  Analysis.consolidateAnalysis = function (onAnalysis) {
      onAnalysis.list = [];
      var sentenceCount = onAnalysis.raw._views._InitialView.Sentence.length;
      var chunkCount = onAnalysis.raw._views._InitialView.Chunk.length;
      var tokenCount = onAnalysis.raw._views._InitialView.Token.length;
      var chunkIndex = 0;
      var tokenIndex = 0;
      var nextChunk = {};
      var nextToken = {};

      onAnalysis.chunkSummary = {};
      onAnalysis.tokenSummary = {};

      for (var sentenceIndex = 0; sentenceIndex < sentenceCount; sentenceIndex++) {
          var sentence = onAnalysis.raw._views._InitialView.Sentence[sentenceIndex];
          sentence.displayType = "Sentence";
          sentence.displayId = "Sentence-" + sentenceIndex;
          sentence.displayLevel = 1;
          onAnalysis.list.push(sentence);

          nextChunk = onAnalysis.raw._views._InitialView.Chunk[chunkIndex];
          while ((chunkIndex < chunkCount) && (nextChunk.end <= sentence.end)) {
              nextChunk.displayType = lookup[nextChunk.chunkType] + " (" + nextChunk.chunkType + ")";
              nextChunk.displayId = "Chunk-" + chunkIndex;
              nextChunk.displayLevel = 2;
              onAnalysis.list.push(nextChunk);

              if (typeof onAnalysis.chunkSummary[nextChunk.text] !== 'undefined') {
                  onAnalysis.chunkSummary[nextChunk.text].count++;
              } else {
                  var chunkSummary = {};
                  chunkSummary.text = nextChunk.text;
                  chunkSummary.count = 1;
                  chunkSummary.displayType = "Chunk";
                  chunkSummary.posCount = {};
                  onAnalysis.chunkSummary[nextChunk.text] = chunkSummary;
              }

              if (typeof onAnalysis.chunkSummary[nextChunk.text].posCount[nextChunk.chunkType] !== 'undefined') {
                  onAnalysis.chunkSummary[nextChunk.text].posCount[nextChunk.chunkType]++;
              } else {
                  onAnalysis.chunkSummary[nextChunk.text].posCount[nextChunk.chunkType] = 1;
              }

              nextToken = onAnalysis.raw._views._InitialView.Token[tokenIndex];
              while ((tokenIndex < tokenCount) && (nextToken.end <= nextChunk.end)) {
                  nextToken.displayType = lookup[nextToken.pos] + " (" + nextToken.pos + ")";
                  nextToken.displayId = "Token-" + chunkIndex;
                  nextToken.displayLevel = 3;
                  onAnalysis.list.push(nextToken);

                  if (typeof onAnalysis.tokenSummary[nextToken.text] !== 'undefined') {
                      onAnalysis.tokenSummary[nextToken.text].count++;
                  } else {
                      var tokenSummary = {};
                      tokenSummary.text = nextToken.text;
                      tokenSummary.count = 1;
                      tokenSummary.displayType = "Token";
                      tokenSummary.posCount = {};
                      onAnalysis.tokenSummary[nextToken.text] = tokenSummary;
                  }

                  if (typeof onAnalysis.tokenSummary[nextToken.text].posCount[nextToken.pos] !== 'undefined') {
                      onAnalysis.tokenSummary[nextToken.text].posCount[nextToken.pos]++;
                  } else {
                      onAnalysis.tokenSummary[nextToken.text].posCount[nextToken.pos] = 1;
                  }

                  nextToken = onAnalysis.raw._views._InitialView.Token[++tokenIndex];
              }

              nextChunk = onAnalysis.raw._views._InitialView.Chunk[++chunkIndex];
          }
      }

      onAnalysis.summaryList = _und.union(_und.values(onAnalysis.chunkSummary), _und.values(onAnalysis.tokenSummary));
  }

  var lookup = {};
  lookup.CC = "Coordinating Conjuction";
  lookup.LS = "List Item";
  lookup.PRPS = "Possessive Pronoun";
  lookup.VBD = "Past Tense Verb";
  lookup.CD = "Cardinal Number";
  lookup.MD = "Modal";
  lookup.RB = "Adverb";
  lookup.VBG = "Present Participle Verb";
  lookup.DT = "Determiner";
  lookup.NN = "Noun";
  lookup.RBR = "Comparative Adverb";
  lookup.VBN = "Past Participle Verb";
  lookup.EX = "Existential There";
  lookup.NNS = "Plural Noun";
  lookup.RBS = "Superlative Adverb";
  lookup.VBP = "Non-3rd Present Verb";
  lookup.FW = "Foreign Word";
  lookup.NNP = "Proper Noun";
  lookup.RP = "Particle";
  lookup.VBZ = "3rd Person Present Verb";
  lookup.IN = "Preposition";
  lookup.NNPS = "Plural Proper Noun";
  lookup.SYM = "Symbol";
  lookup.WDT = "WH Determiner";
  lookup.JJ = "Adjective";
  lookup.PDT = "Predeterminer";
  lookup.TO = "To";
  lookup.WP = "WH Pronoun";
  lookup.JJR = "Comparative Adjective";
  lookup.POS = "Possessive Ending";
  lookup.UH = "Interjection";
  lookup.WPS = "Possessive WH Pronoun";
  lookup.JJS = "Superlative Adjective";
  lookup.PRP = "Personal Pronoun";
  lookup.VB = "Verb";
  lookup.WRB = "WH Adverb";
  lookup.ADJP = "Adjective";
  lookup.NP = "Noun Phrase";
  lookup.UCP = "Unlike Coordinated Phrase";
  lookup.ADVP = "Adverb";
  lookup.NX = "Head Noun";
  lookup.VP = "Verb Phrase";
  lookup.CONJP = "Conjunction";
  lookup.PP = "Prepositional";
  lookup.WHADJP = "WH Adjective";
  lookup.FRAG = "Fragment";
  lookup.PRN = "Parenthetical";
  lookup.WHAVP = "WH Adverb";
  lookup.INTJ = "Interjection";
  lookup.PRT = "Particle";
  lookup.WHNP = "WH Noun";
  lookup.LST = "List";
  lookup.QP = "Quantifier";
  lookup.WHPP = "WH Prepositional";
  lookup.NAC = "Not A Constituent";
  lookup.RRC = "Reduced Relative Clause";

  // Does this (X) really exist?
  lookup.X = "Unknown";
  lookup.UNCHUNKED = "Unchunked";

};

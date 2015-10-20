module.exports = function(Analysis) {

  var http = require('http');
  var util = require('util');
  var _und = require('../../node_modules/underscore/underscore.js');
  var request = require('request');

  function requestAnalysisJSON(req, forModelKind, onId, cb) {
    console.log('::: ANALYZING: ' + forModelKind + " - " + onId);

    var instance = global.koheseKDB.retrieveModelInstance(forModelKind, onId);

    var requestData = {};
    var analysis = new Analysis;
    analysis.id = onId;
    analysis.raw = {};
    analysis.forModelKind = forModelKind;
    analysis.name = "Analysis for: " + instance.name;

    if (instance.name) {
      requestData.name = instance.name;
      analysis.raw.name = {};
    }

    if (instance.description) {
      requestData.description = instance.description;
      analysis.raw.description = {};
    }

    var options = {
      uri : "http://localhost:9091/services/analysis",
      method : 'POST',
      json : true,
      body : requestData
    };

//    console.log('OPTIONS: ' + JSON.stringify(options));
    
    request(options, function(analysisError, analysisResponse, analysisBody) {
      if (analysisError) {
        error = new Error(
            '*** Failure while communicating with Analysis server');
        error.http_code = 504;
        error.code = err.code;
        error.syscall = err.syscall;
        console.log(error);
        cb(error, null);

        console.log("*** Error:");
        console.log(error);
      } else {
        // console.log("--- Body:");
        // console.log(analysisBody);

        try {
          var analysisBody;
          for ( var key in analysisBody) {
            analysis.raw[key] = JSON.parse(analysisBody[key]);
          }
          Analysis.consolidateAnalysis(analysis);
          // delete the raw data
          delete analysis.__data.raw;
          global.koheseKDB.storeModelInstance("Analysis", analysis);
          console.log('::: ANALYSIS Completed: ' + onId);
        } catch (err) {
          console.log("*** Error parsing result for: " + forModelKind + "- "
              + onId + " - " + analysis.name);
          console.log("Analysis response body:  >>>");
          console.log(analysisBody);
          console.log("<<<");
          console.log(err);
        }

        cb(null, analysis);

      }
    });
  }

  Analysis.performAnalysis = function(req, forModelKind, onId, cb) {
    console.log("::: Preparing to analyze " + forModelKind + " " + onId);

    var analysis = global.koheseKDB.retrieveModelInstance("Analysis", onId);
    if (analysis) {
      cb(null, analysis);
    } else {
      requestAnalysisJSON(req, forModelKind, onId, cb);
    }
  }

  Analysis.remoteMethod('performAnalysis', {
    accepts : [ {
      arg : 'req',
      type : 'object',
      'http' : {
        source : 'req'
      }
    }, {
      arg : 'forModelKind',
      type : 'string'
    }, {
      arg : 'onId',
      type : 'string'
    } ],
    returns : {
      arg : 'data',
      type : 'object'
    }
  });

  Analysis.afterRemoteError('performAnalysis', function(ctx, next) {
    ctx.res.status(ctx.error.http_code).end(ctx.error.message);
  });

  function addChunkToSummary(onAnalysis, key, chunkIndex, nextChunk) {
    nextChunk.displayType = lookup[nextChunk.chunkType] + " ("
        + nextChunk.chunkType + ")";
    nextChunk.displayId = key + "-Chunk-" + chunkIndex;
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
  }

  function addTokenToSummary(onAnalysis, key, tokenIndex, nextToken) {
    nextToken.displayType = lookup[nextToken.pos] + " (" + nextToken.pos + ")";
    nextToken.displayId = key + "-Token-" + tokenIndex;
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
  }

  Analysis.consolidateAnalysis = function(onAnalysis) {
    onAnalysis.list = [];
    var nextChunk = {};
    var nextToken = {};

    onAnalysis.chunkSummary = {};
    onAnalysis.tokenSummary = {};

    for ( var key in onAnalysis.raw) {
      var rawData = onAnalysis.raw[key];
      if (rawData._views) {
        var view = rawData._views._InitialView;

        var chunkIndex = 0;
        var tokenIndex = 0;

        var sentenceCount = 0;
        var chunkCount = 0;
        var tokenCount = 0;

        if (view.Sentence) {
          sentenceCount = view.Sentence.length;
        }
        if (view.Chunk) {
          chunkCount = view.Chunk.length;
        }
        if (view.Token) {
          tokenCount = view.Token.length;
        }

        for (var sentenceIndex = 0; sentenceIndex < sentenceCount; sentenceIndex++) {
          var sentence = view.Sentence[sentenceIndex];
          sentence.displayType = "Sentence";
          sentence.displayId = key + "-Sentence-" + sentenceIndex;
          sentence.displayLevel = 1;
          onAnalysis.list.push(sentence);

          if (chunkIndex < chunkCount) {
            nextChunk = view.Chunk[chunkIndex];
          }
          while ((chunkIndex < chunkCount) && (nextChunk.end <= sentence.end)) {

            addChunkToSummary(onAnalysis, key, chunkIndex, nextChunk);
              
            if (tokenIndex < tokenCount) {
              nextToken = view.Token[tokenIndex];
            }
            while ((tokenIndex < tokenCount)
                && (nextToken.end <= nextChunk.end)) {

              addTokenToSummary(onAnalysis, key, tokenIndex, nextToken);
              
              // Check for more tokens in this chunk
              if (tokenIndex < tokenCount) {
                nextToken = view.Token[++tokenIndex];
              }
            }

            // Check for more chunks in this sentence
            if (chunkIndex < chunkCount) {
              nextChunk = view.Chunk[++chunkIndex];
            }
          }
          
          // Check for trailing tokens in the sentence
          if (tokenIndex < tokenCount) {
            nextToken = view.Token[tokenIndex];
          }
          while ((tokenIndex < tokenCount)
              && (nextToken.end <= sentence.end)) {

            addTokenToSummary(onAnalysis, key, tokenIndex, nextToken);
            
            // Check for more tokens in this chunk
            if (tokenIndex < tokenCount) {
              nextToken = view.Token[++tokenIndex];
            }
          }
        }
      }
    }

    onAnalysis.summaryList = _und.union(_und.values(onAnalysis.chunkSummary),
        _und.values(onAnalysis.tokenSummary));
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

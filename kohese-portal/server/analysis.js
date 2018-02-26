
  var http = require('http');
  var util = require('util');
  var _und = require('underscore');
  var request = require('request');
  var kdb = require('./kdb.js');

  var lookup = {
      CC: 'Coordinating Conjuction',
      LS: 'List Item',
      PRPS: 'Possessive Pronoun',
      VBD: 'Past Tense Verb',
      CD: 'Cardinal Number',
      MD: 'Modal',
      RB: 'Adverb',
      VBG: 'Present Participle Verb',
      DT: 'Determiner',
      NN: 'Noun',
      RBR: 'Comparative Adverb',
      VBN: 'Past Participle Verb',
      EX: 'Existential There',
      NNS: 'Plural Noun',
      RBS: 'Superlative Adverb',
      VBP: 'Non-3rd Present Verb',
      FW: 'Foreign Word',
      NNP: 'Proper Noun',
      RP: 'Particle',
      VBZ: '3rd Person Present Verb',
      IN: 'Preposition',
      NNPS: 'Plural Proper Noun',
      SYM: 'Symbol',
      WDT: 'WH Determiner',
      JJ: 'Adjective',
      PDT: 'Predeterminer',
      TO: 'To',
      WP: 'WH Pronoun',
      JJR: 'Comparative Adjective',
      POS: 'Possessive Ending',
      UH: 'Interjection',
      WPS: 'Possessive WH Pronoun',
      JJS: 'Superlative Adjective',
      PRP: 'Personal Pronoun',
      VB: 'Verb',
      WRB: 'WH Adverb',
      ADJP: 'Adjective',
      NP: 'Noun Phrase',
      UCP: 'Unlike Coordinated Phrase',
      ADVP: 'Adverb',
      NX: 'Head Noun',
      VP: 'Verb Phrase',
      CONJP: 'Conjunction',
      PP: 'Prepositional',
      WHADJP: 'WH Adjective',
      FRAG: 'Fragment',
      PRN: 'Parenthetical',
      WHAVP: 'WH Adverb',
      INTJ: 'Interjection',
      PRT: 'Particle',
      WHNP: 'WH Noun',
      LST: 'List',
      QP: 'Quantifier',
      WHPP: 'WH Prepositional',
      NAC: 'Not A Constituent',
      RRC: 'Reduced Relative Clause',
      X: 'Unknown',
      XKPC: 'Pseudo Chunk'
  };

  function requestAnalysisJSON(forProxy, cb) {
    let onId = forProxy.item.id;
    let forModelKind= forProxy.kind;
    console.log('::: ANALYZING: ' + onId);
    
    var instance = forProxy.item;

    var requestData = {};
    var analysis = {};
    analysis.id = onId;
    analysis.raw = {};
    analysis.forModelKind = forModelKind;
    analysis.name = 'Analysis for: ' + instance.name;

    if (instance.name) {
      requestData.name = instance.name;
      analysis.raw.name = {};
    }

    if (instance.description) {
      requestData.description = instance.description;
      analysis.raw.description = {};
    }

    var options = {
      uri : 'http://localhost:9091/services/analysis',
      method : 'POST',
      json : true,
      body : requestData
    };

//    console.log('OPTIONS: ' + JSON.stringify(options));
    
    request(options, function(analysisError, analysisResponse, analysisBody) {
      if (analysisError) {
        var error = new Error(
            '*** Failure while communicating with Analysis server');
        
        // jshint -W106
        error.http_code = 504;
        // jshint +W106 
        
        error.code = analysisError.code;
        error.syscall = analysisError.syscall;
        console.log(error);
        cb({error: error});

        console.log('*** Error:');
        console.log(error);
      } else {
        // console.log('--- Body:');
        // console.log(analysisBody);

        try {
          for ( var key in analysisBody) {
            analysis.raw[key] = JSON.parse(analysisBody[key]);
          }
          consolidateAnalysis(analysis);
          
          // delete the raw data
          delete analysis.raw;

          forProxy.analysis = analysis;
          kdb.storeModelAnalysis(analysis);
          
          console.log('::: ANALYSIS Completed: ' + onId);
          cb(analysis);
        } catch (err) {
          console.log('*** Error parsing result for: ' + forModelKind + ' - ' +
              onId + ' - ' + analysis.name);
          console.log('Analysis response body:  >>>');
          console.log(analysisBody);
          console.log('<<<');
          console.log(err);
          console.log(err.stack);
          
          var parseError = new Error(
          '*** Failure while parsing analysis');
          parseError.onId = onId;
          console.log(parseError);
          cb({error: parseError});

        }

      }
    });
  }

  function performAnalysis (forModelKind, onId, cb){
    
    console.log('::: Preparing to analyze ' + forModelKind + ' ' + onId);

    let forProxy = kdb.ItemProxy.getProxyFor(onId);
    let analysis = kdb.retrieveAnalysis(forProxy);
    
    if (analysis) {
      cb(analysis);
    } else {
      requestAnalysisJSON(forProxy, cb);
    }
  }
  module.exports.performAnalysis = performAnalysis;

  function addPseudoChunkToSummary(onAnalysis, key, tokenIndex, nextToken){
    // Create a pseudo chunk to associate this token with
    var pseudoChunk = JSON.parse(JSON.stringify(nextToken));
    pseudoChunk.chunkType = 'XKPC';
    delete pseudoChunk.pos;
    
    addChunkToSummary(onAnalysis, key, 'Pseudo-' + tokenIndex, pseudoChunk);
    addTokenToSummary(onAnalysis, key, tokenIndex, nextToken);    
  }

  function addChunkToSummary(onAnalysis, key, chunkIndex, nextChunk) {
    nextChunk.displayType = lookup[nextChunk.chunkType] + ' (' +
        nextChunk.chunkType + ')';
    nextChunk.displayId = key + '-Chunk-' + chunkIndex;
    nextChunk.displayLevel = 3;
    onAnalysis.list.push(nextChunk);

    if (typeof onAnalysis.chunkSummary[nextChunk.text] !== 'undefined') {
      onAnalysis.chunkSummary[nextChunk.text].count++;
    } else {
      var chunkSummary = {};
      chunkSummary.text = nextChunk.text;
      chunkSummary.count = 1;
      chunkSummary.displayType = 'Chunk';
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
    nextToken.displayType = lookup[nextToken.pos] + ' (' + nextToken.pos + ')';
    nextToken.displayId = key + '-Token-' + tokenIndex;
    nextToken.displayLevel = 4;
    onAnalysis.list.push(nextToken);

    if (typeof onAnalysis.tokenSummary[nextToken.text] !== 'undefined') {
      onAnalysis.tokenSummary[nextToken.text].count++;
    } else {
      var tokenSummary = {};
      tokenSummary.text = nextToken.text;
      tokenSummary.count = 1;
      tokenSummary.displayType = 'Token';
      tokenSummary.posCount = {};
      onAnalysis.tokenSummary[nextToken.text] = tokenSummary;
    }

    if (typeof onAnalysis.tokenSummary[nextToken.text].posCount[nextToken.pos] !== 'undefined') {
      onAnalysis.tokenSummary[nextToken.text].posCount[nextToken.pos]++;
    } else {
      onAnalysis.tokenSummary[nextToken.text].posCount[nextToken.pos] = 1;
    }
  }

  function consolidateAnalysis(onAnalysis) {
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
          sentence.displayType = 'Sentence';
          sentence.displayId = key + '-Sentence-' + sentenceIndex;
          sentence.displayLevel = 2;
          onAnalysis.list.push(sentence);

          if (chunkIndex < chunkCount) {
            nextChunk = view.Chunk[chunkIndex];
          }
          while ((chunkIndex < chunkCount) && (nextChunk.end <= sentence.end)) {

            while (nextToken && (nextToken.end < nextChunk.begin)){
              addPseudoChunkToSummary(onAnalysis, key, tokenIndex, nextToken);

              
              if (tokenIndex < tokenCount) {
                nextToken = view.Token[++tokenIndex];
              } else {
                nextToken = undefined;
              }
            }

            addChunkToSummary(onAnalysis, key, chunkIndex, nextChunk);
              
            if (tokenIndex < tokenCount) {
              nextToken = view.Token[tokenIndex];
            }
            while ((tokenIndex < tokenCount) &&
                (nextToken.end <= nextChunk.end)) {

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
          while ((tokenIndex < tokenCount) &&
              (nextToken.end <= sentence.end)) {

            addPseudoChunkToSummary(onAnalysis, key, tokenIndex, nextToken);
            
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
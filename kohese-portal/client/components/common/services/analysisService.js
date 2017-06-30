/**
 * Created by josh on 9/21/15.
 */


function AnalysisService(Analysis, ItemRepository) {

    var _ = require('underscore');
    var service = this;
    
    service.posFilterCriteria = {
        "Standard": ["RRC","X","NAC","WHPP","QP","LST","WHNP","PRT","INTJ","WHAVP","PRN","FRAG","WHADJP","PP","CONJP","VP","NX","ADVP","UCP","NP","ADJP","WRB","VB","PRP","JJS","WPS","UH","POS","JJR","WP","PDT","JJ","WDT","SYM","NNPS","VBZ","RP","NNP","FW","VBP","RBS","NNS","EX","VBN","RBR","NN","VBG","RB","MD","CD","VBD","PRPS","LS"],
        "Modal": ["MD"],
        "No Filter": ["XKPC","RRC","X","NAC","WHPP","QP","LST","WHNP","PRT","INTJ","WHAVP","PRN","FRAG","WHADJP","PP","CONJP","VP","NX","ADVP","UCP","NP","ADJP","WRB","VB","PRP","JJS","WPS","UH","POS","JJR","WP","TO","PDT","JJ","WDT","SYM","NNPS","IN","VBZ","RP","NNP","FW","VBP","RBS","NNS","EX","VBN","RBR","NN","DT","VBG","RB","MD","CD","VBD","PRPS","LS","CC"],
        "Pseudo": ["XKPC"],
        "Noun Phrases": ["NP"],
        "Verb Phrases": ["VP"],
        "Noun": ["NX","NP","NNPS","NNP","NNS","NN","PRPS","WP","WPS","PRP","WHNP"],
        "Verb": ["VP","VB","VBZ","VBP","VBN","VBG","VBD"]
    }

    service.filterPOS = function (summary, filterCriteria){
      for(var pos in summary.posCount){
        if (filterCriteria.indexOf(pos) != -1){
          return true;
        }
      }
      return false;
    }
    
    service.fetchAnalysis = function (forProxy) {

      // Note:  This logic does a depth first retrieval to decrease the amount of rework associated with roll-up
      // Fetch children
        for (var childIdx = 0; childIdx < forProxy.children.length; childIdx++) {
            service.fetchAnalysis(forProxy.children[childIdx]);
        }

        if (!forProxy.analysis) {
          console.log("::: Retrieving analysis for " + forProxy.item.id + " - " + forProxy.item.name);
          performAnalysis(forProxy);
        }
        
    }

    function performAnalysis(proxy) {

        Analysis.performAnalysis({
            forModelKind: proxy.kind,
            onId: proxy.item.id
        }).$promise.then(function (results) {
                if (!proxy.analysis) {
                    proxy.analysis = {};
                }
                proxy.analysis.data = results.data;
                console.log("::: Analysis performed for: " + proxy.item.id + " - " + proxy.item.name);
                consolidateAnalysis(proxy);
            });
    }

    function consolidateAnalysis(proxy) {
        proxy.analysis.extendedSummaryList = proxy.analysis.data.summaryList;
        rollUpAnalysis(proxy);

    }

    function rollUpAnalysis(proxy) {
        if (!proxy.analysis.data) {
            return;
        }

        console.log("--- Rollup for " + proxy.item.id + " - " + proxy.item.name);

        // Initialize the extendedChunkSummary
        proxy.analysis.extendedChunkSummary = {};
        for (var chunkId in proxy.analysis.data.chunkSummary) {
            var chunkSummary = {};
            var chunk = proxy.analysis.data.chunkSummary[chunkId];
            chunkSummary.text = chunk.text;
            chunkSummary.count = chunk.count;
            chunkSummary.posCount = {};
            for (var pos in chunk.posCount) {
              chunkSummary.posCount[pos] = chunk.posCount[pos]; 
            }
            proxy.analysis.extendedChunkSummary[chunkId] = chunkSummary;
        }

        // Initialize the extendedTokenSummary
        proxy.analysis.extendedTokenSummary = {};

        for (var tokenId in proxy.analysis.data.tokenSummary) {
            var tokenSummary = {};
            var token = proxy.analysis.data.tokenSummary[tokenId];
            tokenSummary.text = token.text;
            tokenSummary.count = token.count;
            tokenSummary.posCount = {};
            for (var pos in token.posCount) {
              tokenSummary.posCount[pos] = token.posCount[pos]; 
            }
            proxy.analysis.extendedTokenSummary[tokenId] = tokenSummary;
        }

        if (proxy.analysis.data.list) {
            proxy.analysis.extendedList = proxy.analysis.data.list.slice();
        } else {
            return;
        }

        for (var childIdx = 0; childIdx < proxy.children.length; childIdx++) {
            var topic = {};
            topic.displayType = proxy.kind;
            topic.item = proxy.children[childIdx].item;
            topic.displayId = topic.item.id;
            topic.text = topic.item.name;
            topic.displayLevel = 1;
            proxy.analysis.extendedList.push(topic);

            var child = proxy.children[childIdx];
            if (child.analysis) {

                if (child.analysis.extendedList) {
                    proxy.analysis.extendedList = proxy.analysis.extendedList.concat(child.analysis.extendedList);

                    for (var chunkId in child.analysis.extendedChunkSummary) {
                        var chunk = child.analysis.extendedChunkSummary[chunkId];
                        if (angular.isDefined(proxy.analysis.extendedChunkSummary[chunkId])) {
                            proxy.analysis.extendedChunkSummary[chunkId].count += chunk.count;
                            for (var pos in chunk.posCount) {
                              if (angular.isDefined(proxy.analysis.extendedChunkSummary[chunkId].posCount[pos])) {
                                  proxy.analysis.extendedChunkSummary[chunkId].posCount[pos] += chunk.posCount[pos];
                              } else {
                                  proxy.analysis.extendedChunkSummary[chunkId].posCount[pos] = chunk.posCount[pos];
                              }
                          }
                        } else {
                            var chunkSummary = {};
                            chunkSummary.text = chunk.text;
                            chunkSummary.count = chunk.count;
                            chunkSummary.posCount = {};
                            for (var pos in chunk.posCount) {
                              chunkSummary.posCount[pos] = chunk.posCount[pos]; 
                            }
                            proxy.analysis.extendedChunkSummary[chunkId] = chunkSummary;
                        }
                    }

                    for (var tokenId in child.analysis.extendedTokenSummary) {
                        var token = child.analysis.extendedTokenSummary[tokenId];
                        if (angular.isDefined(proxy.analysis.extendedTokenSummary[tokenId])) {
                            proxy.analysis.extendedTokenSummary[tokenId].count += token.count;
                            for (var pos in token.posCount) {
                                if (angular.isDefined(proxy.analysis.extendedTokenSummary[tokenId].posCount[pos])) {
                                    proxy.analysis.extendedTokenSummary[tokenId].posCount[pos] += token.posCount[pos];
                                } else {
                                    proxy.analysis.extendedTokenSummary[tokenId].posCount[pos] = token.posCount[pos];
                                }
                            }
                        } else {
                            var tokenSummary = {};
                            tokenSummary.text = token.text;
                            tokenSummary.count = token.count;
                            tokenSummary.posCount = {};
                            for (var pos in token.posCount) {
                              tokenSummary.posCount[pos] = token.posCount[pos]; 
                            }
                            proxy.analysis.extendedTokenSummary[tokenId] = tokenSummary;
                        }
                    }
                }
            }
        }

        proxy.analysis.extendedTokenSummaryList = _.values(proxy.analysis.extendedTokenSummary);
        proxy.analysis.extendedChunkSummaryList = _.values(proxy.analysis.extendedChunkSummary);

        var parentProxy = ItemRepository.getProxyFor(proxy.item.parentId);

        if (parentProxy) {
            console.log("::: Parent found");
            if (angular.isDefined(parentProxy.analysis)) {
                rollUpAnalysis(parentProxy);
            }
        }

    }
};

export default () => {
    angular.module('app.services.analysisservice', ['app.services.itemservice'])
        .service('analysisService', AnalysisService)
}
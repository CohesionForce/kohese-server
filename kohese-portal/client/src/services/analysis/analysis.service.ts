import { Injectable } from '@angular/core'

import { ItemProxy } from '../../../../common/src/item-proxy.js';

import { ItemRepository } from '../item-repository/item-repository.service';

import * as _ from 'underscore';
import { Subscription } from 'rxjs';

@Injectable()
export class AnalysisService {
  treeConfig : any;
  treeConfigSubscription : Subscription;

  /* Static Definitions */
  termFilterCriteria = {
    'Standard': ['RRC','X','NAC','WHPP','QP','LST','WHNP','PRT','INTJ','WHAVP','PRN','FRAG','WHADJP','PP','CONJP','VP','NX','ADVP','UCP','NP','ADJP','WRB','VB','PRP','JJS','WPS','UH','POS','JJR','WP','PDT','JJ','WDT','SYM','NNPS','VBZ','RP','NNP','FW','VBP','RBS','NNS','EX','VBN','RBR','NN','VBG','RB','MD','CD','VBD','PRPS','LS'],
    'No Filter': ['XKPC','RRC','X','NAC','WHPP','QP','LST','WHNP','PRT','INTJ','WHAVP','PRN','FRAG','WHADJP','PP','CONJP','VP','NX','ADVP','UCP','NP','ADJP','WRB','VB','PRP','JJS','WPS','UH','POS','JJR','WP','TO','PDT','JJ','WDT','SYM','NNPS','IN','VBZ','RP','NNP','FW','VBP','RBS','NNS','EX','VBN','RBR','NN','DT','VBG','RB','MD','CD','VBD','PRPS','LS','CC'],
    'Noun': ['NX','NP','NNPS','NNP','NNS','NN','PRPS','WP','WPS','PRP','WHNP'],
    'Verb': ['VP','VB','VBZ','VBP','VBN','VBG','VBD'],
    'Modal': ['MD'],
    'Pseudo': ['XKPC']
  }

  phraseFilterCriteria = {
    'Standard': ['RRC','X','NAC','WHPP','QP','LST','WHNP','PRT','INTJ','WHAVP','PRN','FRAG','WHADJP','PP','CONJP','VP','NX','ADVP','UCP','NP','ADJP','WRB','VB','PRP','JJS','WPS','UH','POS','JJR','WP','PDT','JJ','WDT','SYM','NNPS','VBZ','RP','NNP','FW','VBP','RBS','NNS','EX','VBN','RBR','NN','VBG','RB','MD','CD','VBD','PRPS','LS'],
    'No Filter': ['XKPC','RRC','X','NAC','WHPP','QP','LST','WHNP','PRT','INTJ','WHAVP','PRN','FRAG','WHADJP','PP','CONJP','VP','NX','ADVP','UCP','NP','ADJP','WRB','VB','PRP','JJS','WPS','UH','POS','JJR','WP','TO','PDT','JJ','WDT','SYM','NNPS','IN','VBZ','RP','NNP','FW','VBP','RBS','NNS','EX','VBN','RBR','NN','DT','VBG','RB','MD','CD','VBD','PRPS','LS','CC'],
    'Noun Phrases': ['NP', 'WHNP', 'QP'],
    'Verb Phrases': ['VP'],
    'Adjective Phrase': ['ADJP', 'WHADJP'],
    'Adverb Phrase': ['ADVP', 'WHAVP'],
    'Prepositional Phrase': ['PP', 'WHPP'],
    'Conjunction Phrase': ['CONJP']
  }

  constructor (private ItemRepository : ItemRepository) {
    this.treeConfigSubscription = this.ItemRepository.getTreeConfig().subscribe((newConfig)=>{
      if (newConfig) {
        this.treeConfig = newConfig.config
      }
    })
  }

  filterPOS (summary, filterCriteria) : boolean {
    for(var pos in summary.posCount) {
      if (filterCriteria.indexOf(pos) != -1) {
        return true;
      }
    }
    return false;
  }

  fetchAnalysis (forProxy : ItemProxy) : Promise<any> {
    var analysisComplete = new Promise((resolve, reject) => {
      // Note:  This logic does a depth first retrieval to decrease the amount of rework associated with roll-up
      // Fetch children
      for (var childIdx = 0; childIdx < forProxy.children.length; childIdx++) {
        this.fetchAnalysis(forProxy.children[childIdx]);
      }

      if (!forProxy.analysis) {
        console.log('::: Retrieving analysis for ' + forProxy.item.id + ' - ' + forProxy.item.name);
        this.performAnalysis(forProxy).then(function (results) {
          resolve(results);
        }).catch((error: any) => {
          reject(error);
        });
      }
    });

    return analysisComplete;
  }

  performAnalysis (proxy : ItemProxy) : Promise<any> {
    var analysis = this.ItemRepository.performAnalysis(proxy)

    analysis.then((results) => {
      if (!proxy.analysis) {
        proxy.analysis = {};
      }
      proxy.analysis.data = results;
      console.log('::: Analysis performed for: ' + proxy.item.id + ' - ' + proxy.item.name);
      this.consolidateAnalysis(proxy);
    });

    return analysis;
  }

  consolidateAnalysis (proxy : ItemProxy) : void {
    proxy.analysis.extendedSummaryList = proxy.analysis.data.summaryList;
    this.rollUpAnalysis(proxy);
  }

  AnalysisSummary : {
    text : string,
    count : number,
    posCount : number
  }

  rollUpAnalysis (proxy : ItemProxy) : void {
    if (!proxy.analysis.data) {
      return;
    }

    console.log('--- Rollup for ' + proxy.item.id + ' - ' + proxy.item.name);

    // Initialize the extendedChunkSummary
    proxy.analysis.extendedChunkSummary = {};
    for (var chunkId in proxy.analysis.data.chunkSummary) {
      var chunkSummary : any = {};
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
      var tokenSummary : any = {};
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
      var topic : any = {};
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
            if (proxy.analysis.extendedChunkSummary[chunkId]) {
              proxy.analysis.extendedChunkSummary[chunkId].count += chunk.count;
              for (var pos in chunk.posCount) {
                if (proxy.analysis.extendedChunkSummary[chunkId].posCount[pos]) {
                  proxy.analysis.extendedChunkSummary[chunkId].posCount[pos] += chunk.posCount[pos];
                } else {
                  proxy.analysis.extendedChunkSummary[chunkId].posCount[pos] = chunk.posCount[pos];
                }
              }
            } else {
              var chunkSummary : any= {};
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
            if (proxy.analysis.extendedTokenSummary[tokenId]) {
              proxy.analysis.extendedTokenSummary[tokenId].count += token.count;
              for (var pos in token.posCount) {
                if (proxy.analysis.extendedTokenSummary[tokenId].posCount[pos]) {
                  proxy.analysis.extendedTokenSummary[tokenId].posCount[pos] += token.posCount[pos];
                } else {
                  proxy.analysis.extendedTokenSummary[tokenId].posCount[pos] = token.posCount[pos];
                }
              }
            } else {
              var tokenSummary : any = {};
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

    var parentProxy = this.treeConfig.getProxyFor(proxy.item.parentId);

    if (parentProxy) {
      console.log('::: Parent found');
      if (parentProxy.analysis) {
        this.rollUpAnalysis(parentProxy);
      }
    }
  }
}





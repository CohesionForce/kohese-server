export class MockAnalysisService {
    /* Static Definitions */
    posFilterCriteria = {
      'Standard': ['RRC','X','NAC','WHPP','QP','LST','WHNP','PRT','INTJ','WHAVP','PRN','FRAG','WHADJP','PP','CONJP','VP','NX','ADVP','UCP','NP','ADJP','WRB','VB','PRP','JJS','WPS','UH','POS','JJR','WP','PDT','JJ','WDT','SYM','NNPS','VBZ','RP','NNP','FW','VBP','RBS','NNS','EX','VBN','RBR','NN','VBG','RB','MD','CD','VBD','PRPS','LS'],
      'Modal': ['MD'],
      'No Filter': ['XKPC','RRC','X','NAC','WHPP','QP','LST','WHNP','PRT','INTJ','WHAVP','PRN','FRAG','WHADJP','PP','CONJP','VP','NX','ADVP','UCP','NP','ADJP','WRB','VB','PRP','JJS','WPS','UH','POS','JJR','WP','TO','PDT','JJ','WDT','SYM','NNPS','IN','VBZ','RP','NNP','FW','VBP','RBS','NNS','EX','VBN','RBR','NN','DT','VBG','RB','MD','CD','VBD','PRPS','LS','CC'],
      'Pseudo': ['XKPC'],
      'Noun Phrases': ['NP'],
      'Verb Phrases': ['VP'],
      'Noun': ['NX','NP','NNPS','NNP','NNS','NN','PRPS','WP','WPS','PRP','WHNP'],
      'Verb': ['VP','VB','VBZ','VBP','VBN','VBG','VBD']
    }

  constructor() {

  }

  fetchAnalysis () {
    
  }

  filterPOS () {

  }

  performAnalysis () {

  }

  consolidateAnalysis () {

  }

  rollUpAnalysis () {
    
  }
}
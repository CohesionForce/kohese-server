import { MockAnalysis} from '../data/MockAnalysis';

export class MockAnalysisService {
    /* Static Definitions */
  public termFilterCriteria: object = {
    'Standard': ['RRC', 'X', 'NAC', 'WHPP', 'QP', 'LST', 'WHNP', 'PRT', 'INTJ',
      'WHAVP', 'PRN', 'FRAG', 'WHADJP', 'PP', 'CONJP', 'VP', 'NX', 'ADVP',
      'UCP', 'NP', 'ADJP', 'WRB', 'VB', 'PRP', 'JJS', 'WPS', 'UH', 'POS',
      'JJR', 'WP', 'PDT', 'JJ', 'WDT', 'SYM', 'NNPS', 'VBZ', 'RP', 'NNP', 'FW',
      'VBP', 'RBS', 'NNS', 'EX', 'VBN', 'RBR', 'NN', 'VBG', 'RB', 'MD', 'CD',
      'VBD', 'PRPS', 'LS'],
    'No Filter': ['XKPC', 'RRC', 'X', 'NAC', 'WHPP', 'QP', 'LST', 'WHNP',
      'PRT', 'INTJ', 'WHAVP', 'PRN', 'FRAG', 'WHADJP', 'PP', 'CONJP', 'VP',
      'NX', 'ADVP', 'UCP', 'NP', 'ADJP', 'WRB', 'VB', 'PRP', 'JJS', 'WPS',
      'UH', 'POS', 'JJR', 'WP', 'TO', 'PDT', 'JJ', 'WDT', 'SYM', 'NNPS', 'IN',
      'VBZ', 'RP', 'NNP', 'FW', 'VBP', 'RBS', 'NNS', 'EX', 'VBN', 'RBR', 'NN',
      'DT', 'VBG', 'RB', 'MD', 'CD', 'VBD', 'PRPS', 'LS', 'CC'],
    'Noun': ['NX', 'NP', 'NNPS', 'NNP', 'NNS', 'NN', 'PRPS', 'WP', 'WPS',
      'PRP', 'WHNP'],
    'Verb': ['VP', 'VB', 'VBZ', 'VBP', 'VBN', 'VBG', 'VBD'],
    'Modal': ['MD'],
    'Pseudo': ['XKPC']
  };

  public phraseFilterCriteria: object = {
    'Standard': ['RRC', 'X', 'NAC', 'WHPP', 'QP', 'LST', 'WHNP', 'PRT', 'INTJ',
      'WHAVP', 'PRN', 'FRAG', 'WHADJP', 'PP', 'CONJP', 'VP', 'NX', 'ADVP',
      'UCP', 'NP', 'ADJP', 'WRB', 'VB', 'PRP', 'JJS', 'WPS', 'UH', 'POS',
      'JJR', 'WP', 'PDT', 'JJ', 'WDT', 'SYM', 'NNPS', 'VBZ', 'RP', 'NNP', 'FW',
      'VBP', 'RBS', 'NNS', 'EX', 'VBN', 'RBR', 'NN', 'VBG', 'RB', 'MD', 'CD',
      'VBD', 'PRPS', 'LS'],
    'No Filter': ['XKPC', 'RRC', 'X', 'NAC', 'WHPP', 'QP', 'LST', 'WHNP',
      'PRT', 'INTJ', 'WHAVP', 'PRN', 'FRAG', 'WHADJP', 'PP', 'CONJP', 'VP',
      'NX', 'ADVP', 'UCP', 'NP', 'ADJP', 'WRB', 'VB', 'PRP', 'JJS', 'WPS',
      'UH', 'POS', 'JJR', 'WP', 'TO', 'PDT', 'JJ', 'WDT', 'SYM', 'NNPS', 'IN',
      'VBZ', 'RP', 'NNP', 'FW', 'VBP', 'RBS', 'NNS', 'EX', 'VBN', 'RBR', 'NN',
      'DT', 'VBG', 'RB', 'MD', 'CD', 'VBD', 'PRPS', 'LS', 'CC'],
    'Noun Phrases': ['NP', 'WHNP', 'QP'],
    'Verb Phrases': ['VP'],
    'Adjective Phrase': ['ADJP', 'WHADJP'],
    'Adverb Phrase': ['ADVP', 'WHAVP'],
    'Prepositional Phrase': ['PP', 'WHPP'],
    'Conjunction Phrase': ['CONJP']
  };

  constructor() {

  }

  fetchAnalysis (proxy) {
    proxy.analysis = MockAnalysis();
    return ({then: ()=>{}});
  }

  filterPOS () {

  }

  performAnalysis () {
    return ({then: ()=>{}})
  }

  consolidateAnalysis () {

  }

  rollUpAnalysis () {
    
  }
}
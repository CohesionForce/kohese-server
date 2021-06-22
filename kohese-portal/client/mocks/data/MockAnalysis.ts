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


export function MockAnalysis () {
  return {
  "data": {
    "id": "cab0b000-bda5-11e7-85ba-279ecb57e99b",
    "forModelKind": "Item",
    "name": "Analysis for: TEST_DOC_Part II_171011.md",
    "list": [
      {
        "sofa": 1,
        "begin": 0,
        "end": 37,
        "text": "TEST_DOC_Part II_171011.md",
        "displayType": "Sentence",
        "displayId": "name-Sentence-0",
        "displayLevel": 2
      },
      {
        "sofa": 1,
        "begin": 0,
        "end": 24,
        "chunkType": "NP",
        "text": "TEST_DOC_Part",
        "displayType": "Noun Phrase (NP)",
        "displayId": "name-Chunk-0",
        "displayLevel": 3
      },
      {
        "sofa": 1,
        "begin": 0,
        "end": 24,
        "pos": "NNP",
        "text": "TEST_DOC_Part",
        "displayType": "Proper Noun (NNP)",
        "displayId": "name-Token-0",
        "displayLevel": 4
      },
      {
        "sofa": 1,
        "begin": 25,
        "end": 37,
        "text": "II_171011.md",
        "chunkType": "XKPC",
        "displayType": "Pseudo Chunk (XKPC)",
        "displayId": "name-Chunk-Pseudo-1",
        "displayLevel": 3
      },
      {
        "sofa": 1,
        "begin": 25,
        "end": 37,
        "pos": "CC",
        "text": "II_171011.md",
        "displayType": "Coordinating Conjuction (CC)",
        "displayId": "name-Token-1",
        "displayLevel": 4
      }
    ],
    "chunkSummary": {
      "TEST_DOC_Part": {
        "text": "TEST_DOC_Part",
        "count": 1,
        "displayType": "Chunk",
        "posCount": {
          "NP": 1
        }
      },
      "II_171011.md": {
        "text": "II_171011.md",
        "count": 1,
        "displayType": "Chunk",
        "posCount": {
          "XKPC": 1
        }
      }
    },
    "tokenSummary": {
      "TEST_DOC_Part": {
        "text": "TEST_DOC_Part",
        "count": 1,
        "displayType": "Token",
        "posCount": {
          "NNP": 1
        }
      },
      "II_171011.md": {
        "text": "II_171011.md",
        "count": 1,
        "displayType": "Token",
        "posCount": {
          "CC": 1
        }
      }
    },
    "summaryList": [
      {
        "text": "TEST_DOC_Part",
        "count": 1,
        "displayType": "Chunk",
        "posCount": {
          "NP": 1
        }
      },
      {
        "text": "II_171011.md",
        "count": 1,
        "displayType": "Chunk",
        "posCount": {
          "XKPC": 1
        }
      },
      {
        "text": "TEST_DOC_Part",
        "count": 1,
        "displayType": "Token",
        "posCount": {
          "NNP": 1
        }
      },
      {
        "text": "II_171011.md",
        "count": 1,
        "displayType": "Token",
        "posCount": {
          "CC": 1
        }
      }
    ]
  },
  "extendedSummaryList": [
    {
      "text": "TEST_DOC_Part",
      "count": 1,
      "displayType": "Chunk",
      "posCount": {
        "NP": 1
      }
    },
    {
      "text": "II_171011.md",
      "count": 1,
      "displayType": "Chunk",
      "posCount": {
        "XKPC": 1
      }
    },
    {
      "text": "TEST_DOC_Part",
      "count": 1,
      "displayType": "Token",
      "posCount": {
        "NNP": 1
      }
    },
    {
      "text": "II_171011.md",
      "count": 1,
      "displayType": "Token",
      "posCount": {
        "CC": 1
      }
    }
  ],
  "extendedChunkSummary": {
    "TEST_DOC_Part": {
      "text": "TEST_DOC_Part",
      "count": 1,
      "posCount": {
        "NP": 1
      }
    },
    "II_171011.md": {
      "text": "II_171011.md",
      "count": 1,
      "posCount": {
        "XKPC": 1
      }
    }
  },
  "extendedTokenSummary": {
    "TEST_DOC_Part": {
      "text": "TEST_DOC_Part",
      "count": 1,
      "posCount": {
        "NNP": 1
      }
    },
    "II_171011.md": {
      "text": "II_171011.md",
      "count": 1,
      "posCount": {
        "CC": 1
      }
    }
  },
  "extendedList": [
    {
      "sofa": 1,
      "begin": 0,
      "end": 37,
      "text": "TEST_DOC_Part II_171011.md",
      "displayType": "Sentence",
      "displayId": "name-Sentence-0",
      "displayLevel": 2
    },
    {
      "sofa": 1,
      "begin": 0,
      "end": 24,
      "chunkType": "NP",
      "text": "TEST_DOC_Part",
      "displayType": "Noun Phrase (NP)",
      "displayId": "name-Chunk-0",
      "displayLevel": 3
    },
    {
      "sofa": 1,
      "begin": 0,
      "end": 24,
      "pos": "NNP",
      "text": "TEST_DOC_Part",
      "displayType": "Proper Noun (NNP)",
      "displayId": "name-Token-0",
      "displayLevel": 4
    },
    {
      "sofa": 1,
      "begin": 25,
      "end": 37,
      "text": "II_171011.md",
      "chunkType": "XKPC",
      "displayType": "Pseudo Chunk (XKPC)",
      "displayId": "name-Chunk-Pseudo-1",
      "displayLevel": 3
    },
    {
      "sofa": 1,
      "begin": 25,
      "end": 37,
      "pos": "CC",
      "text": "II_171011.md",
      "displayType": "Coordinating Conjuction (CC)",
      "displayId": "name-Token-1",
      "displayLevel": 4
    }
  ],
  "extendedTokenSummaryList": [
    {
      "text": "TEST_DOC_Part",
      "count": 1,
      "posCount": {
        "NNP": 1
      }
    },
    {
      "text": "II_171011.md",
      "count": 1,
      "posCount": {
        "CC": 1
      }
    }
  ],
  "extendedChunkSummaryList": [
    {
      "text": "TEST_DOC_Part",
      "count": 1,
      "posCount": {
        "NP": 1
      }
    },
    {
      "text": "II_171011.md",
      "count": 1,
      "posCount": {
        "XKPC": 1
      }
    }
  ]
  }
}

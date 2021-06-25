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


import { ItemCache } from '../../../common/src/item-cache';

export class MockItemCache extends ItemCache {
  constructor() {
    super();

    for (let key in mockData.refs) {
      this.cacheRef(key, mockData.refs[key]);
    }

    for (let key in mockData.kCommit) {
      this.cacheCommit(key, mockData.kCommit[key]);
    }

    for (let key in mockData.kTree) {
      this.cacheTree(key, mockData.kTree[key]);
    }

    for (let key in mockData.blob) {
      this.cacheBlob(key, mockData.blob[key]);
    }

    for (let key in mockData.mismatch_blob) {
      this.cacheBlob(key, mockData.mismatch_blob[key]);
    }

  }
}

let mockData = {
  "refs": {
    "HEAD":
      "6fbeab5deaac47f75dcdd6c5ef3aafdfbd85d9e0",
  },
  "kCommit": {
    "42a8e801f9efef73db114730d5819997e38916d7":
    {
      "time": 1588455056000,
      "author": "admin <test-admin@test.kohese.com>",
      "message": "Second version",
      "parents": [
        "7ef7525795a5c370b0abfa501ab87324f5ce5908"
      ],
      "repoTreeRoots": {
        "ROOT": {
          "kind": "Internal",
          "oid": "ba14baabb49cca43770ca92b36388169a2df5f6c",
          "childTreeHashes": {
            "Model-Definitions": "Internal",
            "a7f32aa0-8cb2-11ea-af25-b1885aaf38b8": "8ad584a2f48fbb8cf730318e416794560c0a7fd9",
            "a070b200-8cb9-11ea-8fbf-21b47b9e2369": "b3057387caeb5cf9fbd8ae92c6876bc2d8cc9936",
            "View-Model-Definitions": "Internal"
          },
          "treeHash": "3c9d4b5d286d7f36e1c1f4479fde10b38e0ecf1f"
        },
        "Model-Definitions": {
          "kind": "Internal",
          "oid": "8109f6a5dfeea6ede032fa99d6cd1b79ef589503",
          "childTreeHashes": {},
          "treeHash": "345e9e2ca3e564286309c916fe28c0300695e963"
        },
        "View-Model-Definitions": {
          "kind": "Internal",
          "oid": "7927f787b40a11b5fb9bf0e929884a344fa2b9ff",
          "childTreeHashes": {},
          "treeHash": "c5f483433c9220df9c8cd0e613b680a831e3aaa4"
        }
      }
    },
    "6fbeab5deaac47f75dcdd6c5ef3aafdfbd85d9e0":
    {
      "time": 1588455338000,
      "author": "admin <test-admin@test.kohese.com>",
      "message": "Third version",
      "parents": [
        "42a8e801f9efef73db114730d5819997e38916d7"
      ],
      "repoTreeRoots": {
        "ROOT": {
          "kind": "Internal",
          "oid": "ba14baabb49cca43770ca92b36388169a2df5f6c",
          "childTreeHashes": {
            "LOST+FOUND": "Internal",
            "Model-Definitions": "Internal",
            "a7f32aa0-8cb2-11ea-af25-b1885aaf38b8": "8ad584a2f48fbb8cf730318e416794560c0a7fd9",
            "457937d0-8cb6-11ea-af25-b1885aaf38b8": "0523201d6212c5be89772bf116833de880e21a3b",
            "206025d0-8cb6-11ea-af25-b1885aaf38b8": "700754ba80249bed30e7599eb3fb597f518ca6aa",
            "a070b200-8cb9-11ea-8fbf-21b47b9e2369": "b3057387caeb5cf9fbd8ae92c6876bc2d8cc9936",
            "View-Model-Definitions": "Internal"
          },
          "treeHash": "6c17e247c874042237e169cc76e51ad0fc3bd0ab"
        },
        "LOST+FOUND": {
          "kind": "Internal",
          "oid": "a428513cdfbef52e379d3506fb820634712667cd",
          "childTreeHashes": {
            "tuser": "d48b3b31ff38c14101a839f4497ede903c091b42"
          },
          "treeHash": "e98561c3e49ffe5b4fddfa2b726455138b75862d"
        },
        "Model-Definitions": {
          "kind": "Internal",
          "oid": "8109f6a5dfeea6ede032fa99d6cd1b79ef589503",
          "childTreeHashes": {},
          "treeHash": "345e9e2ca3e564286309c916fe28c0300695e963"
        },
        "View-Model-Definitions": {
          "kind": "Internal",
          "oid": "7927f787b40a11b5fb9bf0e929884a344fa2b9ff",
          "childTreeHashes": {},
          "treeHash": "c5f483433c9220df9c8cd0e613b680a831e3aaa4"
        }
      }
    },
    "7ef7525795a5c370b0abfa501ab87324f5ce5908":
    {
      "time": 1588454726000,
      "author": "admin <test-admin@test.kohese.com>",
      "message": "First version",
      "parents": [
        "f46b327b1ea6c19f30dcd943a9d7a845b857d466"
      ],
      "repoTreeRoots": {
        "ROOT": {
          "kind": "Internal",
          "oid": "ba14baabb49cca43770ca92b36388169a2df5f6c",
          "childTreeHashes": {
            "Model-Definitions": "Internal",
            "a7f32aa0-8cb2-11ea-af25-b1885aaf38b8": "d16e6ec1ccf87c8b85a9c4209058dd0d1e39e0bd",
            "a070b200-8cb9-11ea-8fbf-21b47b9e2369": "b3057387caeb5cf9fbd8ae92c6876bc2d8cc9936",
            "View-Model-Definitions": "Internal"
          },
          "treeHash": "4848d41c35764a38c3ed31600687b036f711d393"
        },
        "Model-Definitions": {
          "kind": "Internal",
          "oid": "8109f6a5dfeea6ede032fa99d6cd1b79ef589503",
          "childTreeHashes": {},
          "treeHash": "345e9e2ca3e564286309c916fe28c0300695e963"
        },
        "View-Model-Definitions": {
          "kind": "Internal",
          "oid": "7927f787b40a11b5fb9bf0e929884a344fa2b9ff",
          "childTreeHashes": {},
          "treeHash": "c5f483433c9220df9c8cd0e613b680a831e3aaa4"
        }
      }
    },
    "f46b327b1ea6c19f30dcd943a9d7a845b857d466":
    {
      "time": 1588453947000,
      "author": "default-username <default-email>",
      "message": "Creation of new repo",
      "parents": [],
      "repoTreeRoots": {
        "ROOT": {
          "kind": "Internal",
          "oid": "ba14baabb49cca43770ca92b36388169a2df5f6c",
          "childTreeHashes": {
            "Model-Definitions": "Internal",
            "View-Model-Definitions": "Internal"
          },
          "treeHash": "f6e29af7a636ac840dc8d9fee05c83647d2179f9"
        },
        "Model-Definitions": {
          "kind": "Internal",
          "oid": "8109f6a5dfeea6ede032fa99d6cd1b79ef589503",
          "childTreeHashes": {},
          "treeHash": "345e9e2ca3e564286309c916fe28c0300695e963"
        },
        "View-Model-Definitions": {
          "kind": "Internal",
          "oid": "7927f787b40a11b5fb9bf0e929884a344fa2b9ff",
          "childTreeHashes": {},
          "treeHash": "c5f483433c9220df9c8cd0e613b680a831e3aaa4"
        }
      }
    },
  },
  "kTree": {
    "0523201d6212c5be89772bf116833de880e21a3b":
    {
      "kind": "Task",
      "oid": "dce9bfc68925da78a135cf3c0f7443d3cfcdda44",
      "childTreeHashes": {},
      "treeHash": "0523201d6212c5be89772bf116833de880e21a3b",
      "parentId": "ROOT"
    },
    "1a5a85e29ed4a04a912ce0b3f666d87dd5594f28":
    {
      "kind": "KoheseUser",
      "oid": "1d134b6d99fc73b74f0c87b3b5a1ee28282a4e87",
      "childTreeHashes": {},
      "treeHash": "1a5a85e29ed4a04a912ce0b3f666d87dd5594f28",
      "parentId": "a070b200-8cb9-11ea-8fbf-21b47b9e2369"
    },
    "345e9e2ca3e564286309c916fe28c0300695e963":
    {
      "kind": "Internal",
      "oid": "8109f6a5dfeea6ede032fa99d6cd1b79ef589503",
      "childTreeHashes": {},
      "treeHash": "345e9e2ca3e564286309c916fe28c0300695e963"
    },
    "3c9d4b5d286d7f36e1c1f4479fde10b38e0ecf1f":
    {
      "kind": "Internal",
      "oid": "ba14baabb49cca43770ca92b36388169a2df5f6c",
      "childTreeHashes": {
        "Model-Definitions": "Internal",
        "a7f32aa0-8cb2-11ea-af25-b1885aaf38b8": "8ad584a2f48fbb8cf730318e416794560c0a7fd9",
        "a070b200-8cb9-11ea-8fbf-21b47b9e2369": "b3057387caeb5cf9fbd8ae92c6876bc2d8cc9936",
        "View-Model-Definitions": "Internal"
      },
      "treeHash": "3c9d4b5d286d7f36e1c1f4479fde10b38e0ecf1f"
    },
    "4848d41c35764a38c3ed31600687b036f711d393":
    {
      "kind": "Internal",
      "oid": "ba14baabb49cca43770ca92b36388169a2df5f6c",
      "childTreeHashes": {
        "Model-Definitions": "Internal",
        "a7f32aa0-8cb2-11ea-af25-b1885aaf38b8": "d16e6ec1ccf87c8b85a9c4209058dd0d1e39e0bd",
        "a070b200-8cb9-11ea-8fbf-21b47b9e2369": "b3057387caeb5cf9fbd8ae92c6876bc2d8cc9936",
        "View-Model-Definitions": "Internal"
      },
      "treeHash": "4848d41c35764a38c3ed31600687b036f711d393"
    },
    "684e812323d7c191348090515de99ea3da3ac12c":
    {
      "kind": "KoheseUser",
      "oid": "4477b5e812545f85fc4d46e6e99c30ba6447a485",
      "childTreeHashes": {},
      "treeHash": "684e812323d7c191348090515de99ea3da3ac12c",
      "parentId": "a070b200-8cb9-11ea-8fbf-21b47b9e2369"
    },
    "6c17e247c874042237e169cc76e51ad0fc3bd0ab":
    {
      "kind": "Internal",
      "oid": "ba14baabb49cca43770ca92b36388169a2df5f6c",
      "childTreeHashes": {
        "LOST+FOUND": "Internal",
        "Model-Definitions": "Internal",
        "a7f32aa0-8cb2-11ea-af25-b1885aaf38b8": "8ad584a2f48fbb8cf730318e416794560c0a7fd9",
        "457937d0-8cb6-11ea-af25-b1885aaf38b8": "0523201d6212c5be89772bf116833de880e21a3b",
        "206025d0-8cb6-11ea-af25-b1885aaf38b8": "700754ba80249bed30e7599eb3fb597f518ca6aa",
        "a070b200-8cb9-11ea-8fbf-21b47b9e2369": "b3057387caeb5cf9fbd8ae92c6876bc2d8cc9936",
        "View-Model-Definitions": "Internal"
      },
      "treeHash": "6c17e247c874042237e169cc76e51ad0fc3bd0ab"
    },
    "700754ba80249bed30e7599eb3fb597f518ca6aa":
    {
      "kind": "Task",
      "oid": "da16ba55255a6bf0938f45d4b9e2ea4333c7e59d",
      "childTreeHashes": {
        "e6022190-8cb5-11ea-af25-b1885aaf38b8": "81145004b583c36d973708d63ff12487a79eecca"
      },
      "treeHash": "700754ba80249bed30e7599eb3fb597f518ca6aa",
      "parentId": "ROOT"
    },
    "81145004b583c36d973708d63ff12487a79eecca":
    {
      "kind": "Issue",
      "oid": "e29c0ea6107e7c50744de775b12ba3386713aa60",
      "childTreeHashes": {},
      "treeHash": "81145004b583c36d973708d63ff12487a79eecca",
      "parentId": "206025d0-8cb6-11ea-af25-b1885aaf38b8"
    },
    "8ad584a2f48fbb8cf730318e416794560c0a7fd9":
    {
      "kind": "Item",
      "oid": "73175468ff942a6f791429421be1b7b33b83cdc2",
      "childTreeHashes": {},
      "treeHash": "8ad584a2f48fbb8cf730318e416794560c0a7fd9",
      "parentId": "ROOT"
    },
    "b3057387caeb5cf9fbd8ae92c6876bc2d8cc9936":
    {
      "kind": "Item",
      "oid": "c765da8e79d96e336ae2257f83f9ab20dea445b6",
      "childTreeHashes": {
        "a07d8340-8cb9-11ea-8fbf-21b47b9e2369": "684e812323d7c191348090515de99ea3da3ac12c",
        "389dc1d0-8cba-11ea-8fbf-21b47b9e2369": "1a5a85e29ed4a04a912ce0b3f666d87dd5594f28"
      },
      "treeHash": "b3057387caeb5cf9fbd8ae92c6876bc2d8cc9936"
    },
    "c5f483433c9220df9c8cd0e613b680a831e3aaa4":
    {
      "kind": "Internal",
      "oid": "7927f787b40a11b5fb9bf0e929884a344fa2b9ff",
      "childTreeHashes": {},
      "treeHash": "c5f483433c9220df9c8cd0e613b680a831e3aaa4"
    },
    "d16e6ec1ccf87c8b85a9c4209058dd0d1e39e0bd":
    {
      "kind": "Item",
      "oid": "528945ce5095eacad6dcba87c6cb8afa71baf260",
      "childTreeHashes": {},
      "treeHash": "d16e6ec1ccf87c8b85a9c4209058dd0d1e39e0bd",
      "parentId": "ROOT"
    },
    "d48b3b31ff38c14101a839f4497ede903c091b42":
    {
      "kind": "Internal-Lost",
      "oid": "83a3d9ba2dc5539a1c506b81de74ee2e462e5aed",
      "childTreeHashes": {},
      "treeHash": "d48b3b31ff38c14101a839f4497ede903c091b42",
      "parentId": "LOST+FOUND"
    },
    "e98561c3e49ffe5b4fddfa2b726455138b75862d":
    {
      "kind": "Internal",
      "oid": "a428513cdfbef52e379d3506fb820634712667cd",
      "childTreeHashes": {
        "tuser": "d48b3b31ff38c14101a839f4497ede903c091b42"
      },
      "treeHash": "e98561c3e49ffe5b4fddfa2b726455138b75862d"
    },
    "f6e29af7a636ac840dc8d9fee05c83647d2179f9":
    {
      "kind": "Internal",
      "oid": "ba14baabb49cca43770ca92b36388169a2df5f6c",
      "childTreeHashes": {
        "Model-Definitions": "Internal",
        "View-Model-Definitions": "Internal"
      },
      "treeHash": "f6e29af7a636ac840dc8d9fee05c83647d2179f9"
    },
  },
  "blob": {
    "1d134b6d99fc73b74f0c87b3b5a1ee28282a4e87":
    {
      "password": "kohese",
      "email": "tuser@test.kohese.com",
      "id": "389dc1d0-8cba-11ea-8fbf-21b47b9e2369",
      "name": "tuser",
      "description": "Test User",
      "parentId": "a070b200-8cb9-11ea-8fbf-21b47b9e2369",
      "createdBy": "admin",
      "createdOn": 1588454134426,
      "modifiedBy": "admin",
      "modifiedOn": 1588454202989
    },
    "3cc762b5501e0d558314aecc7aed03c835319ff9":
      "",
    "4477b5e812545f85fc4d46e6e99c30ba6447a485":
    {
      "password": "$2a$10$ICExkKQhK64v4B7lU5DeHe43oSkkE9.CNooXiR7rPeZLEqoiixibW",
      "email": "test-admin@test.kohese.com",
      "id": "a07d8340-8cb9-11ea-8fbf-21b47b9e2369",
      "name": "admin",
      "description": "Administrator",
      "parentId": "a070b200-8cb9-11ea-8fbf-21b47b9e2369",
      "createdBy": "admin",
      "createdOn": 1588453947682,
      "modifiedBy": "admin",
      "modifiedOn": 1588454115103
    },
    "528945ce5095eacad6dcba87c6cb8afa71baf260":
    {
      "id": "a7f32aa0-8cb2-11ea-af25-b1885aaf38b8",
      "name": "Test Item",
      "description": "This is a description.\n\n* It has some bullets.\n* That demonstrate that it works.",
      "parentId": "ROOT",
      "createdBy": "admin",
      "createdOn": 1588450825774,
      "modifiedBy": "admin",
      "modifiedOn": 1588450953802
    },
    "5382cedd86c34c143dc46fd8deae27d20417c814":
    {
      "id": "a0431250-8cb9-11ea-ba69-ebccdd96132a",
      "name": "Root of kdb/test-kdb-two",
      "description": "Root of a repository."
    },
    "73175468ff942a6f791429421be1b7b33b83cdc2":
    {
      "id": "a7f32aa0-8cb2-11ea-af25-b1885aaf38b8",
      "name": "Test Item",
      "description": "This is a description.\n\n* It has some bullets.\n* That demonstrate that it works.\n* It supports **bold** and *italic*.",
      "parentId": "ROOT",
      "createdBy": "admin",
      "createdOn": 1588450825774,
      "modifiedBy": "admin",
      "modifiedOn": 1588452003592
    },
    "c765da8e79d96e336ae2257f83f9ab20dea445b6":
    {
      "id": "a070b200-8cb9-11ea-8fbf-21b47b9e2369",
      "name": "Users",
      "description": "User accounts",
      "createdBy": "admin",
      "createdOn": 1588453947680,
      "modifiedBy": "admin",
      "modifiedOn": 1588453947680
    },
    "da16ba55255a6bf0938f45d4b9e2ea4333c7e59d":
    {
      "taskState": "Proposed",
      "id": "206025d0-8cb6-11ea-af25-b1885aaf38b8",
      "name": "Test Task",
      "description": "Do something.",
      "parentId": "ROOT",
      "createdBy": "admin",
      "createdOn": 1588452411694,
      "modifiedBy": "admin",
      "modifiedOn": 1588452444333
    },
    "dce9bfc68925da78a135cf3c0f7443d3cfcdda44":
    {
      "taskState": "Proposed",
      "id": "457937d0-8cb6-11ea-af25-b1885aaf38b8",
      "name": "Test Resolution Task",
      "description": "Fix something",
      "parentId": "ROOT",
      "createdBy": "admin",
      "createdOn": 1588452470580,
      "modifiedBy": "admin",
      "modifiedOn": 1588452506573
    },
    "e29c0ea6107e7c50744de775b12ba3386713aa60":
    {
      "issueState": "Observed",
      "observedBy": "tuser",
      "observedOn": 1588395600000,
      "context": [
        {
          "id": "a7f32aa0-8cb2-11ea-af25-b1885aaf38b8"
        }
      ],
      "id": "e6022190-8cb5-11ea-af25-b1885aaf38b8",
      "name": "Test issue",
      "description": "It looks like something is wrong.",
      "parentId": "206025d0-8cb6-11ea-af25-b1885aaf38b8",
      "createdBy": "admin",
      "createdOn": 1588452265808,
      "modifiedBy": "admin",
      "modifiedOn": 1588452457892
    },
  },
  "mismatch_blob": {
    "7927f787b40a11b5fb9bf0e929884a344fa2b9ff":
    {
      "id": "View-Model-Definitions",
      "name": "View Model Definitions"
    },
    "8109f6a5dfeea6ede032fa99d6cd1b79ef589503":
    {
      "id": "Model-Definitions",
      "name": "Model Definitions"
    },
    "83a3d9ba2dc5539a1c506b81de74ee2e462e5aed":
    {
      "id": "tuser",
      "name": "Lost Item: KoheseUser with username of tuser",
      "description": "Found node(s) referencing this node.",
      "parentId": "LOST+FOUND"
    },
    "a428513cdfbef52e379d3506fb820634712667cd":
    {
      "id": "LOST+FOUND",
      "name": "Lost-And-Found",
      "description": "Collection of node(s) that are no longer connected."
    },
    "ba14baabb49cca43770ca92b36388169a2df5f6c":
    {
      "id": "ROOT",
      "name": "Root of Knowledge Tree"
    },
  },
}

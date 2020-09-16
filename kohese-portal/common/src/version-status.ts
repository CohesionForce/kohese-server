/**
 *
 */

'use strict'; //Required for use of 'class'

export enum VersionControlState {
  CURRENT = 'Current', IGNORED = 'Ignored', CONFLICT = 'Conflict', STAGED =
    'Staged', UNSTAGED = 'Unstaged'
}

export enum VersionControlSubState {
  NONE = 'None', NEW = 'New', MODIFIED = 'Modified', RENAMED = 'Renamed',
    DELETED = 'Deleted', TYPE_CHANGE = 'Type Change', UNREADABLE = 'Unreadable'
}

const VERSION_CONTROL_STATUS_MAP: any = {
  CURRENT: {
      state: VersionControlState.CURRENT,
      substate: VersionControlSubState.NONE
    },
  IGNORED: {
      state: VersionControlState.IGNORED,
      substate: VersionControlSubState.NONE
    },
  CONFLICTED: {
      state: VersionControlState.CONFLICT,
      substate: VersionControlSubState.NONE
    },
  INDEX_NEW: {
      state: VersionControlState.STAGED,
      substate: VersionControlSubState.NEW
    },
  INDEX_MODIFIED: {
      state: VersionControlState.STAGED,
      substate: VersionControlSubState.MODIFIED
    },
  INDEX_RENAMED: {
      state: VersionControlState.STAGED,
      substate: VersionControlSubState.RENAMED
    },
  INDEX_DELETED: {
      state: VersionControlState.STAGED,
      substate: VersionControlSubState.DELETED
    },
  INDEX_TYPECHANGE: { // Shouldn't happen
      state: VersionControlState.STAGED,
      substate: VersionControlSubState.TYPE_CHANGE
    },
  WT_NEW: {
      state: VersionControlState.UNSTAGED,
      substate: VersionControlSubState.NEW
    },
  WT_MODIFIED: {
      state: VersionControlState.UNSTAGED,
      substate: VersionControlSubState.MODIFIED
    },
  WT_RENAMED: {
      state: VersionControlState.UNSTAGED,
      substate: VersionControlSubState.RENAMED
    },
  WT_DELETED: {
      state: VersionControlState.UNSTAGED,
      substate: VersionControlSubState.DELETED
    },
  WT_TYPECHANGE: { // Shouldn't happen
      state: VersionControlState.UNSTAGED,
      substate: VersionControlSubState.TYPE_CHANGE
    },
  WT_UNREADABLE: { // Shouldn't happen
      state: VersionControlState.UNSTAGED,
      substate: VersionControlSubState.UNREADABLE
    }
};

interface VCObjectType {
  Current? : boolean,
  Ignored? : boolean,
  Conflict? : boolean,
  Staged? : string,
  Unstaged? : string
};

export class VersionStatus {

  private vcArray : Array<string> = [];
  private vcObject : VCObjectType = {};

  //////////////////////////////////////////////////////////////////////////
  constructor(statuses? : Array<string>){
    if (statuses) {
      this.updateStatus(statuses);
    }
  }

  //////////////////////////////////////////////////////////////////////////
  get statusArray () {
    return this.vcArray;
  }

  //////////////////////////////////////////////////////////////////////////
  get statusObject () {
    return this.vcObject;
  }

  //////////////////////////////////////////////////////////////////////////
  isUnstaged() : boolean {
    return this.vcObject.hasOwnProperty('Unstaged');
  }

  //////////////////////////////////////////////////////////////////////////
  isStaged() : boolean {
    return this.vcObject.hasOwnProperty('Staged');
  }

  //////////////////////////////////////////////////////////////////////////
  isNew() : boolean {
    return (this.vcArray.filter((status: string) => {
      return status.endsWith('_NEW');
    }).length > 0);
  }

  //////////////////////////////////////////////////////////////////////////
  hasChanges() : boolean {
    return (
      this.vcObject.hasOwnProperty('Staged') ||
      this.vcObject.hasOwnProperty('Unstaged')
    );
  }

  //////////////////////////////////////////////////////////////////////////
  hasStatus() : boolean {
    return this.vcArray.length > 0;
  }

  //////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////
  updateStatus(itemStatus : Array<string>){
    this.vcArray.length = 0;
    this.vcArray.push(...itemStatus);

    if (itemStatus.length > 0) {
      this.vcObject = VersionStatus.translateStatus(itemStatus);
    } else {
      for (let fieldName in this.vcObject) {
        delete this.vcObject[fieldName];
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////
  static translateStatus(statuses: Array<string>): any {
    let translatedStatus: any = {};
    for (let j: number = 0; j < statuses.length; j++) {
      let statusValue: any = VERSION_CONTROL_STATUS_MAP[statuses[j]];
      translatedStatus[statusValue.state] = statusValue.substate;
    }

    return translatedStatus;
  }

}


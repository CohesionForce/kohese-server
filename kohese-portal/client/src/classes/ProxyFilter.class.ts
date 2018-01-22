export class ProxyFilter {
  actionAssignee : string;
  actionState : string;
  dirty : boolean;
  invalidRegex : boolean;
  kind : string;
  status : boolean; // This seems wrong
  text : string;
  textRegex : RegExp;
  textRegexHighlight : RegExp;

  constructor () {
    this.actionAssignee = '';
    this.actionState = '';
    this.dirty = false;
    this.invalidRegex = false;
    this.kind = '';
    this.status = false;
    this.text = '';
    // TODO - figure out what to do with these
    this.textRegex = undefined;
    this.textRegexHighlight = undefined;
  }
}

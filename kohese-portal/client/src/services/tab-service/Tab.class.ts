export class Tab {
  title: string;
  type: string;
  id: number;
  params: Object;

  constructor (title: string, params: Object, id: number) {
    this.title = title;
    this.params = params;
    this.id = id;
  }


}

export class Tab {
  title: string;
  type: string;
  id: number;
  params: Object;

  constructor (title: string, route: string, params: Object, id: number) {
    this.title = title;
    this.params = params;
    this.id = id;
  }


}

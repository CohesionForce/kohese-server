export class Tab {
  title: string;
  type: string;
  route: string;
  id: number;
  params: Object;
  position: number;

  constructor (title: string, route: string, params: Object, id: number,
               position: number) {
    this.title = title;
    this.params = params;
    this.id = id;
    this.route = route;
    this.position = position;
  }
}

declare module SharedWorker {
  interface AbstractWorker extends EventTarget {
      onerror: (ev: ErrorEvent) => any;
  }
  export interface SharedWorker extends AbstractWorker {
      port: MessagePort;
      onconnect: (messageEvent: MessageEvent) => void;
  }
}
declare var SharedWorker: {
  prototype: SharedWorker.SharedWorker;
  new(stringUrl: string, name?: string): SharedWorker.SharedWorker;
};
// Merely added the onconnect() method to the file provied via:
// npm install --save-dev retyped-sharedworker-tsd-ambient
// Definitions by: Toshiya Nakakura <https://github.com/nakakura>

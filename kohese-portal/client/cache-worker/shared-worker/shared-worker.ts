/// <reference path=".\shared-worker.d.ts" />

(<any>self).onconnect = (connectEvent: MessageEvent) => {
  const messagePort: MessagePort = (connectEvent.ports as MessagePort[])[0];

  messagePort.onmessage = function (messageEvent: MessageEvent) {
      const workerResult: number = messageEvent.data.firstNumber * messageEvent.data.secondNumber;
      messagePort.postMessage(workerResult);
  };

};

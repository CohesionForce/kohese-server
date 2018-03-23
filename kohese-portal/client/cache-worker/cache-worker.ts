console.log('$$$ Loading Cache Working');

import * as SocketIoClient from 'socket.io-client';

(<any>self).onconnect = (e) => {
  var port = e.ports[0];

  console.log('$$$ Received new connection');
  console.log(e);

  port.onmessage = function(event) {

    switch(event.data.type){
      case 'processAuthToken':
        console.log('$$$ processAuthToken');
        console.log(event.data);
      default:
        console.log('$$$ Received unexpected event:' + event.data.type);
        console.log(event);
    }
  }

}

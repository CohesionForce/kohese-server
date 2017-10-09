/* This service handles communication with the server when a document is being
   imported into Kohese */

function ImportService() {
    const ctrl = this;
    
}

export default () => {
    angular.module('app.services.importservice', [])
        .service("ImportService", ImportService);
}
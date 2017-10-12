
function KoheseIO($rootScope, socketFactory, AuthTokenFactory) {

    var socket, ioSocket, isAuthenticated,
    self = {
        isInitialized: isInitialized,
        isAuthenticated: isAuthenticated
        };
    
    var isInitialized = false;
    
    // by default the socket property is null and is not authenticated
    self.socket = socket;
    
    // initializer function to connect the socket for the first time after logging in to the app
    self.initialize = function()
    {
        console.log("+++ Initializing KoheseIO");

        isAuthenticated = false;
        isInitialized = true;

        //call btford angular-socket-io library factory to connect to server at this point
        self.socket = socket = socketFactory({
            ioSocket: ioSocket
        });

        //---------------------
        //these listeners will only be applied once when socket.initialize is called
        //they will be triggered each time the socket connects/re-connects (e.g. when logging out and logging in again)
        //----------------------
        socket.on('authenticated', function () {
            isAuthenticated = true;
            console.log('::: KoheseIO is authenticated');
            $rootScope.$broadcast('KoheseIOAuthenticated');
        });
        //---------------------
        socket.on('connect', function () {
            //send the jwt
            console.log('::: KoheseIO is connected')
            socket.emit('authenticate', {token: AuthTokenFactory.getToken()});
        });
        socket.on('disconnect', function () {
            console.log('::: KoheseIO is disconnected')
            isAuthenticated = false;
            });
    }; /* End KoheseIO.initialize */
    
    self.connect = function() {
        if (isInitialized){
            console.log("+++ Connecting KoheseIO");
            self.socket.connect();
        } else {
            self.initialize();
        }
    };
    
    self.disconnect = function() {
        console.log("--- Disconnecting KoheseIO");
        if (isInitialized)
            {
            self.socket.disconnect();
            isAuthenticated = false;
            }        
        };
    
    if (AuthTokenFactory.getToken()){
        self.initialize();
    }

    return self;
};

export default () => {
    angular.module('app.factories.koheseio',['app.services.authentication','btford.socket-io'])
        .factory('KoheseIO', KoheseIO);
}
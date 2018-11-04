const authentification_routing = require('./authentification.js');
const home_routing = require('./home.js');
const rooms_routing = require('./rooms.js');

const setRoutes = function(app) {
    authentification_routing.setAuthentificationRoutes(app);
    home_routing.setHomeRoutes(app);
    rooms_routing.setRoomsRoutes(app);
}

module.exports = {
    setRoutes
}
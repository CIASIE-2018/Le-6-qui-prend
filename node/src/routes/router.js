const home = require('./home.js');
const authentification = require('./authentification.js');

const setRoutes = function(app) {
    home.setHomeRoute(app);
    authentification.setAuthentificationRoutes(app);
}

module.exports = {
    setRoutes
}
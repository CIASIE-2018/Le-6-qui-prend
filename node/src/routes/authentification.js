const controller = require('../controllers/controller.js');
const { check, validationResult } = require('express-validator/check');
const { sanitize } = require('express-validator/filter');

module.exports = {
    setAuthentificationRoutes: function(app) {
        this.registerRoute(app);
        this.connexionRoute(app);
    },
    registerRoute: function(app) {
        app.post('/register', (req, res) => {
            controller.tryRegister(req);
            res.redirect('/');
        });
    },
    connexionRoute: function(app) {
        app.post('/connect', (req, res) => {
            controller.tryLogin(req);
            res.redirect('/');
        });
    }
}
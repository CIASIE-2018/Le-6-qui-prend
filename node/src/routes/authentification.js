const controller = require('../controllers/controller.js');
const { check, validationResult } = require('express-validator/check');
const { sanitize } = require('express-validator/filter');

module.exports = {
    setAuthentificationRoutes: function(app) {
        app.get("/", (req, res) => {
            res.render("auth", { error: req.session.server_error });
        });
        app.post('/register', (req, res) => {
            controller.tryRegister(req, res);
        });
        app.post('/connect', (req, res) => {
            controller.tryLogin(req, res);
        });
    },
}
const controller = require('../controllers/controller.js');

module.exports = {
    setHomeRoutes: function(app) {
        app.get("/home", (req, res) => {
            if (req.session.pseudo !== undefined) {
                res.render("home", { pseudo: req.session.pseudo, rooms: JSON.stringify(app.rooms), error: req.session.server_error });
            } else {
                res.redirect("/");
            }
        });
        app.post("/topplayers", (req, res) => {
            controller.getTopPlayers(res);
        });
    }
}
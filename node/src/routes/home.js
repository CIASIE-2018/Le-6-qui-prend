module.exports = {
    setHomeRoute: function(app) {
        app.get("/home", (req, res) => {
            if (req.session.pseudo !== undefined) {
                res.render("home", { pseudo: req.session.pseudo });
            } else {
                res.redirect("/");
            }
        });
    }
}
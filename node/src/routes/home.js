module.exports = {
    setHomeRoute: function(app) {
        app.get("/", (req, res) => {
            res.render("home");
        });
    }
}
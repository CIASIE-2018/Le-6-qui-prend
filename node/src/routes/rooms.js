module.exports = {
    setRoomsRoutes: function(app) {
        app.get("/rooms/:room", (req, res) => {
            res.render("main", { pseudo: req.session.pseudo, room: req.params.room });
        });
        app.post("/newroom", (req, res) => {
            if (req.body.room_name !== "" && !app.rooms.includes(req.body.room_name)) {
                app.rooms.push(req.body.room_name);
                res.redirect("/rooms/" + req.body.room_name);
            } else {
                req.session.server_error = 'room_exists_error';
                res.redirect("/home");
            }
        });
    }
}
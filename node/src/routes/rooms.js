module.exports = {
    setRoomsRoutes: function(app) {
        app.get("/rooms/:room", (req, res) => {
            res.render("main", { pseudo: req.session.pseudo, room: req.params.room });
        });
        app.post("/newroom", (req, res) => {
            if (req.body.room_name !== "") {
                if (!app.rooms.some(function(e) { return e.roomName === req.body.room_name; })) {
                    app.rooms.push({ roomName: req.body.room_name, players: [] });
                    res.redirect("/rooms/" + req.body.room_name);
                } else {
                    req.session.server_error = 'room_exists_error';
                    res.redirect("/home");
                }
            } else {
                req.session.server_error = 'invalid_roomname_error';
                res.redirect("/home");
            }
        });
        app.post("/topplayers/:room", (req, res) => {
            app.rooms.forEach(room => {
                if (req.params.room === room.roomName) {
                    res.send(room.players);
                }
            });
        });
    }
}
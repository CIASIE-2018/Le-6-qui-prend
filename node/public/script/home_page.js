let rooms_area = $('#rooms_area');
let socket = io.connect('http://localhost:8080');

rooms = JSON.parse(rooms);

rooms.forEach(element => {
    rooms_area.append("<li>" + element + "<button id=" + element + ">Rejoindre</button></li>");
    $('#' + element).click(function() {
        window.location.href = "/rooms/" + element;
    });
});

/*function joinRoom(room) {
    window.location.href = "/rooms/" + room;
}*/
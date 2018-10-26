let rooms_area = $('#rooms_area');
let socket = io.connect('http://localhost:8080');

rooms = JSON.parse(rooms);

$('#newroom').click(function() {
    joinRoom($('#room_name').val(), true);
})

rooms.forEach(element => {
    rooms_area.append("<li>" + element + "<button id=" + element + ">Rejoindre</button></li>");
    $('#' + element).click(function() {
        joinRoom(element, false);
    });
});

function joinRoom(room) {
    //socket.emit('join_room', { room: room, create: create });
    window.location.href = "/rooms/" + room;
}
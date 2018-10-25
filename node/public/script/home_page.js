let rooms_area = $('#rooms_area');
let socket = io.connect('http://localhost:8080');

socket.emit('nickname', player);
rooms = JSON.parse(rooms);

$('#newroom').click(function() {
    joinRoom($('#room_name').val(), true);
})

rooms.forEach(element => {
    rooms_area.append("<li>" + element + "<button id=" + element + ">Rejoindre</buttun></li></a>");
    $('#' + element).click(function() {
        joinRoom(element, false);
    });
});

function joinRoom(room, create) {
    socket.emit('join_room', room, create);
    window.location.href = "/rooms/" + room;
}
let rooms_area = $('#rooms_area');
let socket = io.connect('http://localhost:8080');

console.log(player);
socket.emit('nickname', player);
console.log(socket);
/*function displayRooms() {
    con_area.hide();
    reg_area.hide();
    let rooms = array();
    io.sockets.forEach(e => {
        rooms.push(e.room);
    });
    rooms.array.forEach(element => {
        rooms_area.append('<p>' + element.name + ' --- ' + '</p>');
    });
    rooms_area.show();
}*/
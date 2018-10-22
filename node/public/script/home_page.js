let rooms_area = $('#rooms_area');
let reg_area = $('#reg_area');
let con_area = $('#con_area');

//Set handlers for navigation on home page
function setHandlers() {
    $('#display_rooms').click(function() { displayRooms(); });
    $('#display_register').click(function() { displayRegister(); });
    $('#display_connection').click(function() { displayConnexion(); });
}

function displayRooms() {
    con_area.hide();
    reg_area.hide();
    /*let rooms = array();
    io.sockets.forEach(e => {
        rooms.push(e.room);
    });
    rooms.array.forEach(element => {
        rooms_area.append('<p>' + element.name + ' --- ' + '</p>');
    });*/
    rooms_area.show();
}

function displayRegister() {
    rooms_area.hide();
    con_area.hide();
    reg_area.show();
}

function displayConnexion() {
    rooms_area.hide();
    reg_area.hide();
    con_area.show();
}

setHandlers();
displayRooms();
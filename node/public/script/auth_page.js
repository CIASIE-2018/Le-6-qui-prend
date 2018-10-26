let reg_area = $('#reg_area');
let con_area = $('#con_area');

//Set handlers for navigation on home page
function setHandlers() {
    $('#display_rooms').click(function() { displayRooms(); });
    $('#display_register').click(function() { displayRegister(); });
    $('#display_connection').click(function() { displayConnexion(); });
}

function displayRegister() {
    con_area.hide();
    reg_area.show();
}

function displayConnexion() {
    reg_area.hide();
    con_area.show();
}

setHandlers();
displayConnexion();
let rooms_area = $('#rooms_area');
let error_area = $('#error_area');
let socket = io.connect('http://localhost:8080');

switch (error) {
    case undefined:
        break;
    case 'room_exists_error':
        error_area.append("Le nom de salon est déjà utilisé");
        break;
}

rooms = JSON.parse(rooms);

rooms.forEach(element => {
    rooms_area.append("<li>" + element + "<button class='joinRoom' id=" + element + ">Rejoindre</button></li>");
    $('#' + element).click(function() {
        window.location.href = "/rooms/" + element;
    });
});
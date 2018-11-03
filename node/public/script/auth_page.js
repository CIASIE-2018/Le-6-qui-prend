let reg_area = $('#reg_area');
let con_area = $('#con_area');
let error_area = $('#error_area');

switch (error) {
    case undefined:
        break;
    case 'user_exists_error':
        error_area.append("Le nom d'utilisateur est déjà utilisé");
        break;
    case 'login_password_error':
        error_area.append("Le nom d'utilisateur ou le mot de passe est incorrecte.");
        break;
}

//Set handlers for navigation on home page
function setHandlers() {
    $('#display_register').click(function() {
        displayRegister();
        error_area.hide();
    });
    $('#display_connection').click(function() {
        displayConnexion();
        error_area.hide();
    });
}

function displayRegister() {
    con_area.hide();
    reg_area.show();

    $('#display_register').css("background-color","#0174DF");
    $('#display_connection').css("background-color","");
}

function displayConnexion() {
    reg_area.hide();
    con_area.show();

    $('#display_connection').css("background-color","#0174DF");
    $('#display_register').css("background-color","");
}

setHandlers();
displayConnexion();
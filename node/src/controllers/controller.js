const mysql = require('mysql');
const dbconf = require('../../conf/config.js');
const bcrypt = require('bcrypt-nodejs');
const db = mysql.createConnection(dbconf.databaseOptions);

const tryRegister = function(req, res) {
    let sql = mysql.format('SELECT `pseudo` FROM `users` WHERE pseudo=?', req.body.pseudo);
    db.query(sql, function(err, result) {
        if (result.length === 0) {
            sql = 'INSERT INTO `users` (`pseudo`, `password`, `score`) VALUES (?, ?, ?);';
            bcrypt.genSalt(10, function(err, res_salt) {
                bcrypt.hash(req.body.password, res_salt, null, function(err, hash) {
                    sql = mysql.format(sql, [req.body.pseudo, hash, 0]);
                    db.query(sql, function(err, result) {
                        if (err) {
                            res.redirect("/");
                        } else {
                            req.session.pseudo = req.body.pseudo;
                            res.redirect("/home");
                        }
                    });
                });
            });
        } else {
            req.session.server_error = 'user_exists_error';
            res.redirect("/");
        }
    });
}

const tryLogin = function(req, res) {
    let sql = mysql.format('SELECT * FROM `users` WHERE pseudo=?', req.body.pseudo);
    db.query(sql, function(err, result) {
        if (result.length !== 0) {
            bcrypt.compare(req.body.password, result[0].password, function(err, res_hash) {
                if (res_hash) {
                    req.session.pseudo = result[0].pseudo;
                    res.redirect("/home");
                } else {
                    res.redirect("/");
                }
            });
        } else {
            res.redirect("/");
        }
    });
}

module.exports = {
    tryRegister,
    tryLogin
}
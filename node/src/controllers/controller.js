const mysql = require('mysql');
const dbconf = require('../../conf/config.js');
const bcrypt = require('bcrypt-nodejs');
const db = mysql.createConnection(dbconf.databaseOptions);

const tryRegister = function(req) {
    console.log(req.body.pseudo + ' ---- ' + req.body.password);
    let sql = mysql.format('SELECT `pseudo` FROM `users` WHERE pseudo=?', req.body.pseudo);
    db.connect(function(err) {});
    db.query(sql, function(err, result) {
        if (result.length === 0) {
            sql = 'INSERT INTO `users` (`pseudo`, `password`, `score`) VALUES (?, ?, ?);';
            bcrypt.genSalt(10, function(err, res) {
                bcrypt.hash(req.body.password, res, null, function(err, hash) {
                    sql = mysql.format(sql, [req.body.pseudo, hash, 0]);
                    db.query(sql, function(err, result) {});
                    db.end(function(err) {});
                    console.log('INSERTING DONE');
                });
            });
        } else {
            db.end(function(err) {});
            console.log('user already exists');
        }
    });
}

const tryLogin = function(req) {
    let sql = mysql.format('SELECT * FROM `users` WHERE pseudo=?', req.body.pseudo);
    db.connect(function(err) {});
    db.query(sql, function(err, result) {
        if (result.length !== 0) {
            bcrypt.compare(req.body.password, result[0].password, function(err, res) {
                if (res) {
                    console.log('match');
                } else {
                    console.log('doesnt match');
                }
                db.end(function(err) {});
            });
        } else {
            console.log('user not in db');
            db.end(function(err) {});
        }
    });
}

module.exports = {
    tryRegister,
    tryLogin
}
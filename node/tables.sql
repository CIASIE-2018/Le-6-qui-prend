-- USERS
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users`(
    `id` int(11) not null auto_increment,
    `pseudo` text not null,
    `password` char(128) not null,
    `score` int(11) not null,
    `room` text,
    primary key(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
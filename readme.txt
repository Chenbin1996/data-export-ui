1: Please put the files on a server or local host to preview. 

then preview:  
http://localhost/src/
http://localhost/src/material.html
http://localhost/src/#/music/home
http://localhost/html/index.html
http://localhost/landing/index.html


2: Documents locate "src/tpl/docs.html" or "http://localhost/src/index.html#/app/docs"
online: http://flatfull.com/themes/angulr/angular/#/app/docs


3: Use Grunt and Bower

install node.js
go to the app root

>npm install -g grunt-cli
>npm install
>bower install
>npm start

> grunt build:angular --force

to build the 'angular' folder

本项目由angularJS编写，运行时需要Node.js环境；

运行之前，修改src/config下的ip.json，一个是前端运行地址，第二行是后台接口地址。

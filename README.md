# Quiz
The quiz is made for mobile devices as clients. Select the next question using a simplistic admin ui that also renders crude bar charts of the answers' distribution. To bootup the quiz as fast as possible, a captive portal could be used to direct the clients to the quiz.

## Pre-requisites
The quiz is based on node.js (```apt-get install nodejs```).
To install all dependencies browse to the project folder and issue ```npm install```. See ```package.json``` for the dependencies.

## Quick start

Enter the questions in the given format under ```game.json```. Bootup the server using ```node server.js```. Clients browse to ```localhost:8080/```, the admin to ```localhost:8080/admin``` (admin/secret). To push the first question to all connected clients, select the ```Answering``` mode and press ```Next``` as admin. To query the statistics select ```Statistics``` mode. Below the controls renders a bar chart visualising the distribution of the choices.

### Credentials

The credentials are *admin*/*secret* by default and can be configured within server.js

### Ports / HTTPS

Ports are 8080 and 8443 by default. If https protocol is needed the server certificate and server key need to be placed under ```/ssl/server.key``` and ```ssl/server.cert```, otherwise comment the https protocol in server.js


### Cookies and Timeouts

To prohibit the clients from choosing more than once, a client cookie will be set. The timeout is also configured in the client.js. For a more elaborated version, the clients would have to generate a uuid and register on the server which in turn controls the choices and timeouts of each client. Feel free to implement...

### Screen-Lock

To prohibit activation of the screen lock, the client.js uses a dirty hack called [NoSleep.js](https://github.com/richtr/NoSleep.js).

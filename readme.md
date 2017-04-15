# Alternative to passwords

A comparisson between different methods of authentication.

## Methods applied
- One Time Password (_OTP_)
- Universal Second Factor (_U2F_)
- Graphical User Authentication (_GUA_)

## Technologies
| Layer  | Technology | Version |
| --- | --- | --- |
| CSS | Bulma | 0.3.2 |
| Client Framework | VueJS | 2.2.1 |
| Server Platform | NodeJS | 6.10.0 |
| Server Framework | HapiJS | 16.1.1 |

## Installation
- Install NodeJS and clone the repo to your computer

### Server
- ```cd server/```
- ```npm install```
- ```npm start```

This will run the server in the port 9000. Client is requesting this port too so if you change it, remember to change it in the client.

### Client
- ```cd client/```
- ```npm install```
- ```npm run dev```

This will run the client in the port 8080. Running like this will open the app in your browser with _hot-reload_.
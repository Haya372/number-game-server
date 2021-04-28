var express = require('express');
var app = express();
var http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

app.get('/' , function(req, res){
  res.sendFile(__dirname+'/index.html');
});

let rooms = {};

io.on('connection',function(socket){
  console.log('connected');

  socket.on('create', (room_id, username) => {
    /*
    // 同じ名前の部屋を作れなくする処理
    // デバックしづらくなるのでコメントアウトしておく
    if(Object.keys(rooms).includes(room_id)){
      socket.emit('err', {
        msg: 'room "' + room_id + '" already exists'
      });
      return;
    }*/
    socket.join(room_id);
    rooms[room_id] = {
      members: [username],
    };
    socket.join(room_id);
    socket.emit('user_id', {
      user_id: 0
    });
    io.to(room_id).emit('enter', {
      members: rooms[room_id].members
    });
  });

  socket.on('get rooms', () => {
    let res = [];
    Object.keys(rooms).forEach((key) => {
      if(rooms[key].turns) return;
      res.push({
        room_id: key,
        host: rooms[key].members[0],
        people: rooms[key].members.length
      });
    });
    socket.emit('room list', {
      rooms: res
    });
  });

  socket.on('join', (room_id, username) => {
    if(!Object.keys(rooms).includes(room_id)){
      socket.emit('err', {
        msg: 'room "' + room_id + '" not found'
      });
      return;
    }

    if(rooms[room_id].turns){
      socket.emit('err', {
        msg: 'room "' + room_id + '" members have already started the game'
      });
      return;
    }

    let user_id = rooms[room_id].members.length;
    rooms[room_id].members.push(username);
    socket.join(room_id);
    socket.emit('user_id', {
      user_id: user_id
    });
    io.to(room_id).emit('enter', {
      members: rooms[room_id].members
    });
  });

  socket.on('start', (room_id, turns) => {
    if(!Object.keys(rooms).includes(room_id)){
      socket.emit('err', {
        msg: 'room "' + room_id + '" not found'
      });
      return;
    }
    
    rooms[room_id].turns = turns;
    rooms[room_id].turn_num = 1;
    io.to(room_id).emit('start', {
      members: rooms[room_id].members,
      turns: turns
    });
  });

  socket.on('re-entry', (room_id) => {
    socket.join(room_id);
  });

  socket.on('choose', (room_id, user_id, turn_num, number) => {
    if(rooms[room_id].turn_num !== turn_num){
      socket.emit('err', {
        msg: 'now turn is not ' + turn_num + ''
      });
      return;
    }

    if(!rooms[room_id].actions){
      rooms[room_id].actions = new Array(rooms[room_id].members.length);
      rooms[room_id].actions.fill(-1);
    }

    if(rooms[room_id].actions[user_id] !== -1){
      socket.emit('err', {
        msg: 'you have already selected ' + rooms[room_id].actions[user_id]
      });
      return;
    }
    rooms[room_id].actions[user_id] = number;

    if(!rooms[room_id].actions.includes(-1)){
      io.to(room_id).emit('everyone selected', {
        turn_num: rooms[room_id].turn_num,
        numbers: rooms[room_id].actions
      });
      rooms[room_id].actions.fill(-1);
      if(rooms[room_id].turn_num == rooms[room_id].turns){
        rooms[room_id].turn_num = 1;
      }else{
        rooms[room_id].turn_num += 1;
      }
    }

    socket.on('finish', (room_id) => {
      io.to(room_id).emit('finish');
      delete rooms[room_id];
    });

    socket.on('exit room', (room_id) => {
      socket.leave(room_id);
    });
  });
});

http.listen(PORT, function(){
  console.log('server listening. Port:' + PORT);
});
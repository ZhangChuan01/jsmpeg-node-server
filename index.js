const express = require('express');
const Stream = require("my-node-rtsp-stream");
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser')
const http = require('http'),ws = require('ws')
const config = require('config')
const videoSize = config.get('video-size')
let wsServer = null,sockets = []
const initWsServer = (port) => {
  wsServer = new ws.Server({
    port: port
  })
  wsServer.on("connection", (socket) => {
    console.log('connection')
    socket.on("close", () => {
      console.log('close')
      let index = sockets.indexOf(socket)
      if(index > -1){
        sockets.splice(index, 1)
      }
    })
    sockets.push(socket)
  })
}
initWsServer(5500)
function restart(){
  console.log('restart')
  wsServer.close()
  try {
    sockets.forEach(socket => {
      socket.send('restart')
    })
  } catch (error) {
    console.log(error)
  }
  const count = fs.readFileSync(path.join(__dirname, './err.txt'), 'utf8');
  fs.writeFileSync('./err.txt',(Number(count) + 1).toString())
}

function initStream(url,port){
  console.log(url, port)
  try {
    const stream = new Stream({
      name: `sockets${port}`,
      streamUrl: url,
      wsPort: port,
      ffmpegOptions: {
        // 选项ffmpeg标志
        "-stats": "", // 没有必要值的选项使用空字符串
        "-r": 30, // 具有必需值的选项指定键后面的值<br>　　　　'-s':'1920*1080'
        "-fs": 1000000 * videoSize
      }
    })
    stream.on("novideo", () => {
      // console.log("novideonovideonovideonovideonovideooo")
      stream.stop()
      removeVideo(port)
    })
    stream.on('exit', () => {
      try {
        console.log('exitexitexitexitexitexitexitexitexitexit222')
        stream.stop()
        console.log('asdasdasddddddddddddddd')
        // restart()
        removeVideo(port)
      } catch (error) {
        console.log('aaaaa',error)
      }
    })
    stream.on('exitWithError', () => {
      // console.log('exitWithError')
      stream.stop()
      // restart()
      removeVideo(port)
    })
  } catch (error) {
    console.log('err',error)
  }
}
function calcNum(){
  if(currentStreamList.length === 0){
    restart()
  }
}

const app = express()
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Authorization,X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method' )
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH, PUT, DELETE')
  res.header('Allow', 'GET, POST, PATCH, OPTIONS, PUT, DELETE')
  next();
})
app.use(bodyParser())
app.listen(5550)

// 初始化预留端口
const portList = []
for(let i = 0; i < 50; i++){
  portList.push(9950 + i)
}
// 流集合
const currentStreamList = []
// 最后使用端口
let lastPort = 0

// 获取视频流
app.post('/showVideo', async (req, res) => {
  const camera = req.body
  let channels = ['102']
  if(camera.channels){
    channels = camera.channels
  }
  let ports = checkCamera(camera,channels)
  console.log('pppp',ports,channels)
  // res.send({ port })
  if(ports.includes(0)){
    ports.forEach((port,index) => {
      if(port === 0){
        const newPort = getPort()
        if(newPort){
          ports[index] = newPort
          lastPort = newPort
          currentStreamList.push({
            id: camera.ip + channels[index],
            ip: camera.ip,
            port: newPort,
            rtsp_url: `rtsp://${camera.username}:${camera.password}@${camera.ip}:554/Streaming/Channels/${channels[index]}`,
            stream: initStream(`rtsp://${camera.username}:${camera.password}@${camera.ip}:554/Streaming/Channels/${channels[index]}`,newPort)
          })
        }
      }
    })
  }
  res.send({ ports,ip:camera.ip })
})
function checkCamera(camera,channels){
  let ports = []
  channels.forEach(channel => {
    const id = camera.ip + channel
    const target = currentStreamList.find(stream => stream.id === id)
    if(target){
      ports.push(target.port)
    }else{
      ports.push(0)
    }
  })
  return ports
}
function getPort(){
  const currentPortList = currentStreamList.map(stream => stream.port)
  return portList.find(port => !currentPortList.includes(port) && port !== lastPort)
}
function removeVideo(port){
  const index = currentStreamList.findIndex(stream => stream.port === port)
  console.log('removeVideo',currentStreamList, index)
  if(index > -1){
    currentStreamList.splice(index,1)
    // console.log('removeVideo222222222222',currentStreamList)
    calcNum()
  }
}

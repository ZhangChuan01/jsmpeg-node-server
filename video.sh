#!/bin/bash

# 切换到服务所在目录

cd /zkhy/node-server

# 执行 nodemon
node ./node_modules/nodemon/bin/nodemon.js --config ./nodemon.json ./index.js

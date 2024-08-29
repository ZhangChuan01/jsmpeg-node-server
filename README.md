jsmpeg-node-server
================
### 对应于[jsmpeg-vue-component](https://github.com/ZhangChuan01/jsmpeg-vue-component)的后端服务

#### 使用
1. 克隆或下载
    ```  
    git clone https://github.com/ZhangChuan01/jsmpeg-node-server.git
    ```
2. 安装依赖  
    ```
    npm install or yarn
    ```
3. 运行 
    ```
    npm run dev or yarn dev
    ```
#### 说明/注意事项
1. config中可以设置videoSize大小，对于转换的视频流数据一直存放在内存中，如果不加以限制，会无限增加最终导致占满服务器内存而影响其他程序，设置大小意味着一旦视频流数据达到这么大，node服务会重启以此来释放内存，对应前端的处理，自动重连，组件里已经完成
2. 此服务会占用5500（服务端口），5550（前端ws）端口，其次要尽量保证9950-9999（视频流ws）端口不被占用
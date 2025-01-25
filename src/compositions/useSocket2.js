// useAudioPlayer.js
import { ref, onUnmounted, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue'

export function useSocket() {

  let socket;
  let reconnectInterval = 5000;  // 重连间隔，单位：毫秒
  let heartbeatInterval = 30000;  // 心跳间隔，单位：毫秒
  let heartbeatTimer;
  let reconnectTimer;
  const msgList = ref([])
const giftList = ref([])
const hudongList = ref([])
// 直播间当前人数
const currentCount = ref(0)

  function connectWebSocket() {
    socket = new WebSocket('ws://127.0.0.1:8888');

    // 连接建立时触发
    socket.addEventListener('open', function (event) {
      console.log('WebSocket 连接已建立');
      Message.info('WebSocket 连接已建立')
      startHeartbeat();
      // 可以在这里发送消息
      socket.send('Hello, Server!');
    });

    // 收到消息时触发
    socket.addEventListener('message', function (event) {
      const msg = JSON.parse(event.data)
      const message = JSON.parse(msg.Data)
      if (message.CurrentCount) {
        currentCount.value = message.CurrentCount
      }
      // const msg = JSON.parse(event.data)
      // const message = JSON.parse(msg.Data)
      // console.log(message)
      // // 进入直播间消息
      if (message.CurrentCount) {
        currentCount.value = message.CurrentCount
        if (hudongList.value.length > 100) {
          hudongList.value.pop()
        }
        hudongList.value.unshift({
          type:'enter',
          msgId: message.MsgId,
          nickName: message.User.Nickname,
          avatar: message.User.HeadImgUrl

        })
      } else if (message.GiftId) { // 礼物消息
        hudongList.value.unshift({
          type:'gift',
          msgId: message.MsgId,
          nickName: message.GiftName,
          avatar: message.ImgUrl,
          nickName: message.User.Nickname,
          content: message.Content,
          // avatar: message.User.HeadImgUrl
        })
      } else {
        hudongList.value.unshift({
          type:'comment',
          msgId: message.MsgId,
          content: message.Content,
          nickName: message.User.Nickname,
          avatar: message.User.HeadImgUrl
        })
      }
      // 76024962349
      // if (message.User.Id !== '76024962349') {
      // }

      console.log('收到消息:',);
      // 收到服务器的消息，可重置心跳定时器
      resetHeartbeat();
    });

    // 发生错误时触发
    socket.addEventListener('error', function (error) {
      console.error('WebSocket 错误:', error);
      disconnectWebSocket();
    });

    // 连接关闭时触发
    socket.addEventListener('close', function (event) {
      console.log('WebSocket 连接已关闭:', event);
      disconnectWebSocket();
    });
  }

  function startHeartbeat() {
    stopHeartbeat();
    heartbeatTimer = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send('heartbeat');  // 发送心跳消息
        console.log('发送心跳消息');
      } else {
        stopHeartbeat();
      }
    }, heartbeatInterval);
  }

  function stopHeartbeat() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  }

  function resetHeartbeat() {
    stopHeartbeat();
    startHeartbeat();
  }

  function disconnectWebSocket() {
    stopHeartbeat();
    if (socket) {
      socket.close();
      socket = null;
    }
    // 尝试重新连接
    reconnectTimer = setTimeout(() => {
      connectWebSocket();
    }, reconnectInterval);
  }

  return {
    connectWebSocket,
    msgList,
    giftList,
    hudongList,
    currentCount  
  }
}
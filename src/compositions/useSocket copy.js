// useAudioPlayer.js
import { ref, onUnmounted, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue'

export function useSocket(maxListSize = 50) {

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
function handleSocketError(error) {
  console.error('WebSocket 错误:', error);
  disconnectWebSocket();
}

function handleSocketClose(event) {
  console.log('WebSocket 连接已关闭:', event);
  disconnectWebSocket();
}
// 新增内存管理函数
function manageListSize(list) {
  // 如果列表超过最大长度，只保留最新的消息
  if (list.value.length > maxListSize) {
    list.value = list.value.slice(0, maxListSize);
  }
}
  function connectWebSocket() {
    // 确保之前的连接被完全关闭
    if (socket) {
      disconnectWebSocket();
    }
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
      // console.log(message)
      if (hudongList.value.length > 100) {
        hudongList.value.pop()
      }
      if (message.CurrentCount) {
        currentCount.value = message.CurrentCount
       
        hudongList.value.unshift({
          type:'enter',
          msgId: message.MsgId,
          nickName: message.User.Nickname,
          avatar: message.User.HeadImgUrl,
          content: ''

        })
      } else if (message.GiftId) { // 礼物消息
        hudongList.value.unshift({
          type:'gift',
          msgId: message.MsgId,
          giftName: message.GiftName,
          avatar: message.ImgUrl,
          nickName: message.User.Nickname,
          content: message.Content,
          // avatar: message.User.HeadImgUrl
        })
      } else {
        // console.log(typeof message.User?.Id)
        if(message.User.Id !== 76024962349){
          hudongList.value.unshift({
            type:message.CurrentCount==0?'enter':'comment',
            msgId: message.MsgId,
            content: message.CurrentCount==0?'':message.Content,
            nickName: message.User?.Nickname ?? '',
            avatar: message.User?.HeadImgUrl ?? ''
          })
        }
        
      }

      console.log(`count:${hudongList.value.length}`)
      // 76024962349
      // if (message.Id !== '76024962349') {
      // }
      
      // console.log('收到消息:',);
      // 收到服务器的消息，可重置心跳定时器
      resetHeartbeat();
    });

    
  }
  // socket.addEventListener('error', handleSocketError);

  // 连接关闭时触发
  // socket.addEventListener('close',handleSocketClose);
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

  function disconnectWebSocket(reconnect=true) {
    stopHeartbeat();
    if (socket) {
      // 移除事件监听器，防止内存泄漏
      socket.removeEventListener('error', handleSocketError);
      socket.removeEventListener('close', handleSocketClose);
      socket.close();
      socket = null;
    }
    // 清理重连定时器
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    // 尝试重新连接
    if(reconnect){
      reconnectTimer = setTimeout(() => {
        connectWebSocket();
      }, reconnectInterval);
    }
    
  }
 // 使用 Vue 的生命周期钩子管理
 onUnmounted(() => {
  disconnectWebSocket();
});
  return {
    connectWebSocket,
    disconnectWebSocket,
    msgList,
    giftList,
    hudongList,
    currentCount  
  }
}
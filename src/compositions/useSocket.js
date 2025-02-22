import { ref, onUnmounted, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { debounce } from 'lodash-es';
import favicon from '@/assets/favicon.png'
import {useFS} from '@/compositions/useFS.js'
const {writeText} = useFS() 

export function useSocket(maxListSize = 20) {
  let socket;
  let reconnectInterval = 5000;  // 重连间隔，单位：毫秒
  let heartbeatInterval = 30000;  // 心跳间隔，单位：毫秒
  let heartbeatTimer;
  let reconnectTimer;
  const msgList           = ref([]);
  const giftList          = ref([]);
  const hudongList        = ref([]);
  const currentCount      = ref(0);
  const totalViewersCount = ref(0)
  // 保存评论
  const saveComment       = ref(false)
  const filename          = ref()
  // 消息缓存队列
  const messageQueue = ref([]);
  // 创建一个防抖函数，每1秒更新一次，但不丢失消息
  const updateHudongList = debounce(() => {
    if (messageQueue.value.length > 0) {
      // 将缓存的所有消息添加到hudongList
      hudongList.value = [
        ...messageQueue.value,
        ...hudongList.value
      ];

      // 管理列表大小
      manageListSize(hudongList);
      // console.log(`列表长度:${hudongList.value.length}`);
      

      // 清空消息队列
      messageQueue.value = [];
      // console.log(`消息队列长度:${messageQueue.value.length}`);
    }
  }, 300, {
    leading: false,  // 不立即执行
    trailing: true   // 在延迟结束后执行
  });

  function handleSocketError(error) {
    // console.error('WebSocket 错误:', error);
    disconnectWebSocket();
  }

  function handleSocketClose(event) {
    // console.log('WebSocket 连接已关闭:', event);
    disconnectWebSocket();
  }

  // 内存管理：限制列表大小
  function manageListSize(list) {
    if (list.value.length > maxListSize) {
      list.value = list.value.slice(0, maxListSize);  // 只保留最新的maxListSize条数据
    }
  }

  function connectWebSocket() {
    if (socket && socket.readyState === WebSocket.OPEN) {
      return;  // 已经连接，直接返回
    }

    // 确保之前的连接被完全关闭
    disconnectWebSocket(false);
    socket = new WebSocket('ws://127.0.0.1:8888');

    socket.addEventListener('open', function (event) {
      console.log('WebSocket 连接已建立');
      Message.info('弹幕服务连接成功');
      startHeartbeat();
      socket.send('Hello, Server!');
    });

    socket.addEventListener('message', function (event) {
      const originalMsg = JSON.parse(event.data);
      // console.log(typeof originalMsg)
      const message = JSON.parse(originalMsg.Data);
      // console.log(message)
      let newMessage;
      // 1[普通弹幕]，2[点赞消息]，3[进入直播间]，4[关注消息]，5[礼物消息]，6[统计消息]，7[粉丝团消息]，8[直播间分享]，9[下播]
      switch (originalMsg.Type) {
        case 1: // 普通弹幕
          if (message.User?.Nickname !== '国货之光') {
            newMessage= {
              type: 1,
              msgId: message.MsgId,             
              avatar: message.ImgUrl ?? favicon,
              nickName: message.User.Nickname,
              content: message.Content,
              secUid: message.User?.SecUid
            }
            if(saveComment.value){              
              writeText(filename.value,`${newMessage.nickName}::${newMessage.content}\r\n`)
              console.log('保存评论')
            }else{
              console.log('不保存评论')
            }
            
          }          
          break;
        case 2: // 点赞消息
          newMessage= {
            type: 2,
            msgId: message.MsgId,
            content: message.Content,
            nickName: message.User?.Nickname ?? '',
            avatar: message.User?.HeadImgUrl ?? favicon,
            secUid: message.User?.SecUid,
            count:message.Count,
            total:message.Total
          }
          break;  
        case 3: // 进入直播间消息
          newMessage= {
            type: 3,
            msgId: message.MsgId,
            nickName: message.User?.Nickname,
            avatar: message.User?.HeadImgUrl??favicon,
            content: '',
            secUid: message.User?.SecUid
          }  
          // console.log(message)
          currentCount.value = message.CurrentCount;
          break;  
        case 4: // 关注消息
          newMessage= {
            type: 4,
            msgId: message.MsgId,
            nickName: message.User?.Nickname,
            avatar: message.User?.HeadImgUrl??favicon,
            content: '',
            secUid: message.User?.SecUid
          }  
          break; 
        case 5: // 礼物消息
          newMessage= {
            type: 5,
            msgId: message.MsgId,
            giftName: message.GiftName,
            avatar: message.ImgUrl ?? favicon,
            nickName: message.User.Nickname,
            content: message.Content,
            secUid: message.User?.SecUid
          }
          break
        case 6: // 统计消息
        totalViewersCount.value = message.TotalUserCountStr;
        default:
          break;
          // console.log('未知消息类型');
        }

      // 如果有新消息，添加到消息队列
      if (newMessage) {
        messageQueue.value.unshift(newMessage);
        // 触发防抖更新
        updateHudongList();
      }


      resetHeartbeat();
    });

    socket.addEventListener('error', handleSocketError);
    socket.addEventListener('close', handleSocketClose);
  }

  function startHeartbeat() {
    stopHeartbeat();
    heartbeatTimer = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send('heartbeat');  // 发送心跳消息
        // console.log('发送心跳消息');
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

  function disconnectWebSocket(reconnect = true) {
    stopHeartbeat();
    if (socket) {
      socket.removeEventListener('error', handleSocketError);
      socket.removeEventListener('close', handleSocketClose);
      socket.close();
      socket = null;
    }

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    if (reconnect) {
      reconnectTimer = setTimeout(() => {
        connectWebSocket();
      }, reconnectInterval);
    }
  }

  function setSaveComment(filenamestr,value){
    filename.value = filenamestr
    saveComment.value = value
  }

  // 使用 Vue 生命周期钩子清理资源
  onUnmounted(() => {
    disconnectWebSocket();
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }
  });

  return {
    connectWebSocket,
    disconnectWebSocket,
    msgList,
    giftList,
    hudongList,
    currentCount,
    totalViewersCount,
    setSaveComment
  };
}
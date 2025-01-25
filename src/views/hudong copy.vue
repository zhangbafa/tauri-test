<template>
    <div>
        <a-row>
            <a-col :span="24">
                <a-card>
                    <a-space>
                        <a-button type="primary" @click="handleClick">开始报时</a-button>
                        <a-button type="primary" @click="handleStop" status="warning">停止报时</a-button>
                        <audio id="audioPlayer" controls></audio>
                    </a-space>
                </a-card>
            </a-col>
            <a-col style="margin: 10px 0;">
                <a-card>
                    <a-input type="text" v-model="text" style="margin-bottom: 10px;" />
                    <a-space>
                        <a-button @click="handleInsert" type="primary">插入报时</a-button>
                        <a-button @click="handleConnentDanmu" type="primary">连接WS</a-button>
                    </a-space>
                </a-card>
            </a-col>
        </a-row>
        <a-row :gutter="20">
            <a-col span="12">
                <a-card :title="'直播间人数：' + currentCount">
                    <a-list :virtualListProps="{
                        height: 780,
                    }" :data="msgList">
                        <template #item="{ item, index }">
                            <a-list-item :key="item.msgId">
                                <a-list-item-meta :title="item.nickName+'来了'">
                                    <template #avatar>
                                        <a-avatar shape="square">
                                            <img alt="avatar" :src="item.avatar" />
                                        </a-avatar>
                                    </template>
                                </a-list-item-meta>
                                <template #actions>
                                    <icon-send size="22" @click="handlePlayWelcome(item)"/>
                                </template>
                            </a-list-item>
                        </template>
                    </a-list>
                </a-card>
            </a-col>
            <a-col span="12">
                <a-row>
                    <a-col span="24">
                        <a-card title="礼物">
                        <a-list :virtualListProps="{
                            height: 300,
                        }" :data="giftList">
                            <template #item="{ item, index }">
                                <a-list-item :key="item.msgId">
                                    <a-list-item-meta :title="item.nickName+' 送了 '+item.name">
                                        <template #avatar>
                                            <a-avatar shape="square">
                                                <img alt="avatar" :src="item.icon" />
                                            </a-avatar>
                                        </template>
                                    </a-list-item-meta>
                                    <template #actions>
                                        <icon-send size="22" @click="handlePlayGift(item)"/>
                                    </template>
                                </a-list-item>
                            </template>
                        </a-list>
                    </a-card>
                    </a-col>
                    <a-col span="24" style="margin-top: 10px">
                        <a-card title="普通消息">
                    <a-list :virtualListProps="{
                        height: 389,
                    }" :data="hudongList">
                        <template #item="{ item, index }">
                            <a-list-item :key="item.msgId">
                                <a-list-item-meta :title="item.nickName +':'+ item.content">
                                    
                                </a-list-item-meta>
                                <template #actions>
                                    <icon-send size="22" @click="handlePlayHudong(item)"/>
                                </template>
                            </a-list-item>
                        </template>
                    </a-list>
                </a-card>
                    </a-col>
                </a-row>
            </a-col>
        </a-row>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { Message } from '@arco-design/web-vue';
const text = ref('')
const shouldContinue = ref(true)
const msgList = ref([])
const giftList = ref([])
const hudongList = ref([])
// 直播间当前人数
const currentCount = ref(0)
let array = [
    '欢迎来到直播间，我们的小黄车中全部都是零添加的调位料，大家可以放心下单，放行带回家',
    '现在是下午16点55分，欢迎来到直播间',

];

const getTime = () => {
    const date = new Date()
    let hour = date.getHours()
    const minute = date.getMinutes()
    let hour_str = ''
    if (hour < 6) {
        hour_str = '凌晨';
    } else if (hour === 12) {
        hour_str = '中午';
    } else if (hour > 12 && hour < 18) {
        hour_str = '下午';
        hour = hour - 12
    } else if (hour >= 18) {
        hour_str = '晚上';
        hour = hour - 12
    } else {
        hour_str = '早上';
    }
    return `现在是${hour_str}${hour}点${minute},欢迎大家来到我的直播间`
}


const handleInsert = async () => {
    await fetchSpeech(text.value)
}
const handleConnentDanmu = () => {
    connectWebSocket();
}
const handleStop = () => {
    shouldContinue.value = false
}
const handleClick = async () => {
    while (shouldContinue.value) {
        await fetchSpeech(getTime())
        // console.log(get)
        // index = (index + 1) % array.length;
        await new Promise(resolve => setTimeout(resolve, 1000 * 10));
    }
    // shouldContinue.value = true
    // printArrayWithDelay(array);
}
//播报礼物
const handlePlayGift= async (item)=>{
    const nickname = item.Nickname //需要对名字进行过滤
    const giftname = item.name
    const text = `感谢${nickname}送的${giftname}`
    await fetchSpeech(text)
}
// 播报进入直播间消息
const handlePlayWelcome= async (item)=>{
    const nickname = item.nickName //需要对名字进行过滤
    const giftname = item.name
    const text = `欢迎${nickname}进入直播间`
    await fetchSpeech(text)
}

const handlePlayHudong=(item)=>{
    alert(item.content)
}

const fetchSpeech = async (text) => {
    const url = `http://127.0.0.1:5876/voice?text=${text}&model_id=0&speaker_id=0&sdp_ratio=0.2&noise=0.2&noisew=0.9&length=1&auto_translate=false&auto_split=false&style_weight=0.7`;
    const options = {
        method: 'GET',
        headers: {
            'accept': 'application/json'
        }
    };
    const response = await fetch(url, options)
    const blob = await response.blob();
    const audioUrl = URL.createObjectURL(blob);
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.src = audioUrl;
    audioPlayer.play();

}

let socket;
let reconnectInterval = 5000;  // 重连间隔，单位：毫秒
let heartbeatInterval = 30000;  // 心跳间隔，单位：毫秒
let heartbeatTimer;
let reconnectTimer;

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
        console.log(message)
        // 进入直播间消息
        if (message.CurrentCount) {
            currentCount.value = message.CurrentCount
            if (msgList.value.length > 100) {
                msgList.value.pop()
            }
            msgList.value.unshift({
                msgId: message.MsgId,
                nickName: message.User.Nickname,
                avatar: message.User.HeadImgUrl

            })
        }else if (message.GiftId) { // 礼物消息
            giftList.value.unshift({
                msgId: message.MsgId,
                name: message.GiftName,
                icon: message.ImgUrl,
                nickName: message.User.Nickname,
                avatar: message.User.HeadImgUrl
            })
        }else{
            hudongList.value.unshift({
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

// 首次连接

</script>
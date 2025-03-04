<template>
  <div >
    <ul>
     <template v-for="userinfo of state.userList" :key="userinfo.id">
      <li v-if="state.username ===userinfo.username ">
        {{ userinfo.username }}
      </li>
      <li v-else>
        <a href="javascript:;" @click="selectUser(userinfo)">{{ userinfo.username }}</a>
      </li>
     </template>
    </ul>
    <div v-if="state.targetUser">
      <h3 >{{ state.targetUser.username }}</h3>
      <input type="text" v-model="state.msgText">
      <button @click="sendMsg">Send</button>
    </div>
    <div>
      <ul>
        <li v-for="(data,index) of messageList" :key="index">
          <p>{{ data.formUsername }}:{{ new Date(data.dataTime) }}</p>
          <p>{{data.msg}}</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { io } from "socket.io-client";
import { useRouter } from "vue-router";
import { reactive,computed } from "vue";


const rouetr = useRouter()

const state = reactive({
  username:rouetr.currentRoute.value.query.username,
  userList:[],
  targetUser:null,
  msgText:'',
  msgBox:{}
})

const messageList = computed(()=>{
  return (state.msgBox[state.username] && state.targetUser) ? state.msgBox[state.username].filter(item=>{
    return item.formUsername === state.username ||
           item.toUsername === state.username
  }) :[]
})

const selectUser = (userinfo) =>{
 
  state.targetUser = userinfo
  
}

const sendMsg = () =>{
  if(!state.msgText.length) return;

  appendMsg({
    formUsername:state.username,
    toUsername:state.targetUser.name,
    msg:state.msgText,
    dataTime:new Date().getTime()
  })

  // 发送
  socket.emit('send',{
    formUsername:state.username,
    targetId:state.targetUser.id,
    msg:state.msgText
  }
  )
}


const socket = io('http://localhost:3000',{
  query:{
    username:state.username
  }
});

socket.on('online',(data)=>{
  state.userList = data.userList
  
})

socket.on('receive',(data)=>{
  console.log("data===",data);
  
  appendMsg(data)
  
})


socket.on('error',(err)=>{
 
  
})

function  appendMsg(data) {
  !state.msgBox[state.username] && (state.msgBox[state.username] =[])
  state.msgBox[state.username].push(data)  
}
</script>
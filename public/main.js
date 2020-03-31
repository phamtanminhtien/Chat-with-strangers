var socket = io();

Vue.component('chat-item', {
    props: ['mess'],
    template:
    `<div>
        <li class="sent" v-if="mess.type=='send'">
            <img src="http://emilcarlsson.se/assets/mikeross.png" alt="" />
            <p>{{ mess.text }}</p>
        </li>
        
        <li class="replies"  v-if="mess.type=='received'">
            <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
            <p>{{ mess.text }}</p>
        </li>
    </div>`
  })
var load = new Vue({
    el : "#loading",
    data : {
        show : false,
    }
})
var Appchat = new Vue({
    el : "#frame",
    data : {
        sa : "",
        text : "",
        show : false,
        messs : [
            {
                name : "Me",
                text : "Hello",
                type : "sent"
            }
        ]
    },
    methods : {
        send : function(e){
            if(this.text != ""){     
                socket.emit("sendMess", {
                    text : this.text,
                });
                this.addItem({
                    name : "Me",
                    text : this.text,
                    type : "replies"
                }, true);
                this.text = "";
            }else{
            }
            e.preventDefault();
        },
        addItem : function(data, scroll){
            this.messs.push(data);
            if (scroll)  this.scrollToEnd();
        },
        scrollToEnd: function() {    	
            var container = this.$el.querySelector(".messages");
            setTimeout(function(){
                container.scrollTop = container.scrollHeight;
            }, 1);
      }
        
    }
})
var Appname = new Vue({
    el : "#nameBox",
    data: {
        show : true,
        name : "",
    },
    methods :{
        submitName : function(e){
            if(this.name != ""){
                socket.emit("submitName", {name : this.name});
            }else{
                note("Please enter name");
            }
            e.preventDefault();
        }
    }
})

socket.on("user", function(data){
    setTimeout(function(){
        load.show = false;
        Appchat.addItem(
            {
                name : data,
                text : "Hello",
                type : "replies"
            }, false);
        Appchat.sa = data;
        Appname.show = false;
        Appchat.show = true;

    }, 500)
})
socket.on("out", function(){
    Appname.show = true;
    Appchat.show = false;
    Appchat.messs = [
        {
            name : "Me",
            text : "Hello",
            type : "sent"
        }
    ]
    note("Your friend escaped");
})
socket.on("sendMess", function(data){
    Appchat.addItem(data, true);
})
socket.on("resultSubmitName", function(data){
    if(data.r == 0){
        note("Please enter name");
    }else if( data.r == 1){
        note("Name already exists");
    }else if( data.r == 2){
        load.show = true;
    }
});
function note(body){
    $("#bodyNote").text(body);
    $("#noteerr").modal("show");
}
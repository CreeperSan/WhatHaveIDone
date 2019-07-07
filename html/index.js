const ipc = require('electron').ipcRenderer

const vue = new Vue({
    el : '#app',
    data : {
        onPositiveCallback : ()=>{  },
        onNegativeCallback : ()=>{ vue.hideDialog() },
        onDangerCallback : ()=>{ vue.hideDialog() },
        currentTable : '',
        dialogAddHint : '',
        tableItemList : [],
        thingItemList : null,
    },
    created : function(){
        // 加载列表
        getTableList()
    },
    methods : {
        showDialog : function(){
            const self = this
            document.getElementById('dialogBackground').style.display = 'flex'
            document.getElementById('dialogTitle').style.display = 'flex'
            document.getElementById('dialogThings').style.display = 'flex'
            document.getElementById('dialogMessage').style.display = 'flex'
            document.getElementById('dialogPositive').style.display = 'flex'
            document.getElementById('dialogNegative').style.display = 'flex'
            document.getElementById('dialogDanger').style.display = 'flex'
        },
        showAddDialog : function(title, thingItem=null){
            const self = this
            this.showDialog()
            document.getElementById('dialogMessage').style.display = 'none'
            document.getElementById('dialogTitle').innerText = title
            if(thingItem === null){
                document.getElementById('dialogDanger').style.display = 'none'
                document.getElementById('dialogThingTitle').value = ''
                document.getElementById('dialogThingTime').value = ''
                document.getElementById('dialogThingDuration').value = '半天'
                document.getElementById('dialogThingDescription').value = ''
            }else{
                console.log(thingItem)
                document.getElementById('dialogThingTitle').value = thingItem.title
                document.getElementById('dialogThingTime').value = thingItem.time
                document.getElementById('dialogThingDuration').value = thingItem.duration
                if(thingItem.description != undefined){
                    document.getElementById('dialogThingDescription').value = thingItem.description
                }else{
                    document.getElementById('dialogThingDescription').value = ''
                }
            }
            this.onPositiveCallback = function(){
                const title = document.getElementById('dialogThingTitle').value
                const time = document.getElementById('dialogThingTime').value
                const duration = document.getElementById('dialogThingDuration').value
                const description = document.getElementById('dialogThingDescription').value
                if(title === ''){
                    self.dialogAddHint = '请填写标题'
                    return
                }
                if(time === ''){
                    console.log(time)
                    self.dialogAddHint = '请填写时间'
                    return
                }
                if(duration === ''){
                    self.dialogAddHint = '请填写耗时'
                    return
                }
                let item = {}
                item.title = title
                item.time = time
                item.duration = duration
                if(description != ''){
                    item.description = description
                }
                vue.thingItemList.push(item)
                self.sortThing()
                setThingList(self.currentTable, JSON.stringify(self.thingItemList))
                self.hideDialog()
            }
        },
        showMessageDialog : function(title, ){
            this.showDialog()
            document.getElementById('dialogThings').style.display = 'flex'
            document.getElementById('dialogDanger').style.display = 'none'
            document.getElementById('dialogTitle').innerText = title
        },
        hideDialog : function(){
            document.getElementById('dialogBackground').style.display = 'none'
            this.dialogAddHint = ''
        },
        onFABClick : function(){
            this.showAddDialog('添加记录', null);
        },
        onTableItemClick(tableItem){
            getThingList(tableItem)
            this.currentTable = tableItem
        },
        sortThing : function(){

        },
        onThingClick : function(thing){
            const self = this
            this.showAddDialog('编辑记录', thing)
            this.onPositiveCallback = function(){
                const title = document.getElementById('dialogThingTitle').value
                const time = document.getElementById('dialogThingTime').value
                const duration = document.getElementById('dialogThingDuration').value
                const description = document.getElementById('dialogThingDescription').value
                if(title === ''){
                    self.dialogAddHint = '请填写标题'
                    return
                }
                if(time === ''){
                    console.log(time)
                    self.dialogAddHint = '请填写时间'
                    return
                }
                if(duration === ''){
                    self.dialogAddHint = '请填写耗时'
                    return
                }
                thing.title = title
                thing.time = time
                thing.duration = duration
                thing.description = description
                self.sortThing()
                setThingList(self.currentTable, JSON.stringify(self.thingItemList))
                self.hideDialog()
            }
            this.onDangerCallback = function(){

            }
        },
        getDescription : function(description){
            if(description === undefined){
                return ''
            }
            return description.replace('\n','<br>')
        }
    },
})

ipc.on('getTableList', function(event, arg){
    vue.tableItemList = arg
})

ipc.on('getThingList', function(event, arg){
    vue.thingItemList = arg
})

function getTableList(){
    ipc.send('getTableList')
}

function getThingList(name){
    ipc.send('getThingList', name)
}

function setThingList(name, list){
    ipc.send('setThingList', name, list)
}


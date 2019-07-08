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
        showMessageDialog : function(title, message){
            const self = this
            this.showDialog()
            document.getElementById('dialogThings').style.display = 'none'
            document.getElementById('dialogDanger').style.display = 'none'
            document.getElementById('dialogTitle').innerText = title
            document.getElementById('dialogMessage').innerHTML = message
            this.onNegativeCallback = function(){ self.hideDialog() }
            this.onPositiveCallback = function(){ self.hideDialog() }
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
            let resultList = []
            let unformattedTimeThingList = [] // 时间不符合规则的
            let formattedTimeThingList = {}   // 时间符合规则的
            for(let i=0; i<this.thingItemList.length; i++){
                const thingItem = this.thingItemList[i]
                const thingItemTime = this.thingItemList[i].time
                try{
                    if(thingItemTime.length==10 && thingItemTime[4]=='-' && thingItemTime[7]=='-' && parseInt(thingItemTime.slice(0, 4))>2000 && parseInt(thingItemTime.slice(5, 7))<=12 && parseInt(thingItemTime.slice(8, 10))<=30){
                        let thingItemNum = parseInt(thingItemTime.replace('-', '').replace('-', ''))
                        if(formattedTimeThingList[thingItemNum.toString()] == undefined || formattedTimeThingList[thingItemNum.toString()] == null){
                            formattedTimeThingList[thingItemNum.toString()] = [thingItem]
                        }else{
                            formattedTimeThingList[thingItemNum.toString()].push(thingItem)
                        }
                    }else{
                        throw 'err'
                    }
                }catch(e){
                    thingItem.time = "未知时间"
                    unformattedTimeThingList.push(thingItem)
                }
            }
            let keyList = Object.keys(formattedTimeThingList)
            keyList.sort(function(a, b){ return b-a })
            for(let i=0; i<keyList.length; i++){
                let tmpKey = keyList[i]
                for(let j=0; j<formattedTimeThingList[tmpKey].length; j++){
                    resultList.push(formattedTimeThingList[tmpKey][j])
                }
            }
            for(let i=0; i<unformattedTimeThingList.length; i++){
                resultList.push(unformattedTimeThingList[i])
            }
            this.thingItemList = resultList
            console.log('resultList')
            console.log(resultList)
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
                for(let i=0; i<self.thingItemList.length; i++){
                    const thingItem = self.thingItemList[i]
                    if(thingItem == thing){
                        self.thingItemList.splice(i, 1)
                        break
                    }
                }
                self.sortThing()
                setThingList(self.currentTable, JSON.stringify(self.thingItemList))
                self.hideDialog()
            }
        },
        getDescription : function(description){
            if(description === undefined){
                return ''
            }
            return description.replace(new RegExp('\n','gm'),'<br>')
        },
        onCreateTableClick : function(){
            let date = new Date()
            const titleString = this._numToString(date.getFullYear() % 100)+this._numToString(date.getMonth() + 1)
            for(let i=0; i<this.tableItemList.length; i++){
                const tmpItemName = this.tableItemList[i]
                if(tmpItemName == titleString){
                    continue
                }else{
                    this.showMessageDialog("创建表", "表"+titleString+"已存在")
                    return
                }
            }
            setThingList(titleString, [])
            this.showMessageDialog("创建表", "表"+titleString+"创建成功")
        },
        _numToString : function(num){
            let numStr = num.toString()
            while(numStr.length < 2){
                numStr = '0' + numStr
            }
            return numStr
        }
    },
})

ipc.on('getTableList', function(event, arg){
    vue.tableItemList = arg
})

ipc.on('getThingList', function(event, arg){
    vue.thingItemList = arg
    vue.sortThing()
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


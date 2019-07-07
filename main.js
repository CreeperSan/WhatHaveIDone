const fs = require('fs')
const Electron = require('electron')
const BrowserWindow = Electron.BrowserWindow
const ipc = Electron.ipcMain
const app = Electron.app

// Electron.Menu.setApplicationMenu(null)

function createMainWindow(a){
    let window = new BrowserWindow({
        minWidth: 800,
        minHeight:480,
        webPreferences: {
          nodeIntegration: true
        },
    })

    window.loadFile("html/index.html");
    window.webContents.openDevTools()
    window.on('closed',()=>{
        window = null;
    })
}

app.on('ready', createMainWindow)
app.on('window-all-closed', ()=>{
    app.quit()
})

ipc.on('getTableList', function(event, args){
    let fileList = fs.readdirSync('data')
    let resultList = [];
    for(let i=0; i<fileList.length; i++){
        let fileName = fileList[i]
        if(fileName.endsWith('.json') && fileName.length>5){
            resultList.push(fileName.substring(0, fileName.length-5))
        }
    }
    event.sender.send('getTableList', resultList)
})

ipc.on('getThingList', function(event, name){
    const fileContentStr = fs.readFileSync('data/'+name.toString()+'.json').toString()
    let thingList = []
    let fileContent = JSON.parse(fileContentStr)
    for(let i=0; i<fileContent.length; i++){
        let item = fileContent[i]
        let timeTxt = item['time']
        let titleTxt = item['title']
        let durationTxt = item['duration']
        let descriptionTxt = item['description']
        if(timeTxt === undefined || titleTxt === undefined || durationTxt === undefined){
            continue
        }
        let thing = {}
        thing.time = timeTxt
        thing.title = titleTxt
        thing.duration = durationTxt
        if(descriptionTxt !== undefined){
            thing.description = descriptionTxt
        }
        thingList.push(thing)
    }
    event.sender.send('getThingList', thingList)
})

ipc.on('setThingList', function(event, name, content){
    console.log('1111111111111')
    let contentJson = []
    try{
        contentJson = JSON.parse(content)
        console.log('222222222222222222')
        const list = []
        for(let i=0; i<contentJson.length; i++){
            let tmpItem = contentJson[i]
            let timeTxt = tmpItem['time']
            let titleTxt = tmpItem['title']
            let durationTxt = tmpItem['duration']
            let descriptionTxt = tmpItem['description']
            if(timeTxt === undefined || titleTxt === undefined || durationTxt === undefined){
                continue
            }
            let thing = {}
            thing.time = timeTxt
            thing.title = titleTxt
            thing.duration = durationTxt
            if(descriptionTxt !== undefined){
                thing.description = descriptionTxt
            }
            list.push(thing)
        }
        console.log('写入 '+JSON.stringify(list))
        fs.writeFileSync('data/'+name.toString()+'.json', JSON.stringify(list))
    }catch(e){
        return false
    }
    return true
})

ipc.on('deleteTable', function(name){
    try{
        fs.unlinkSync('data/'+name.toString()+'.json')
    }catch(e){
        return false
    }
    return true
})

ipc.on('log', function(event, content){
    console.log(content)
})




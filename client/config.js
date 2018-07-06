const RUN_ON_SERVER = false

function serverUrl(){
    if(RUN_ON_SERVER)
        return 'http://120.78.240.132:3000'
    else
        return 'http://localhost'
}

export default {serverUrl}
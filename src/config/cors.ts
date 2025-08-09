import { CorsOptions } from 'cors'

export const corsConfig: CorsOptions = {
    origin: function(origin, callback){
        const whitelist = ["https://agreeable-sand-0eff0741e.2.azurestaticapps.net/", process.env.FRONTEND_URL]

        if(process.argv[2] == '--api'){
            whitelist.push(undefined)
        }
        if(whitelist.includes(origin)){
            callback(null, true)
        } else{
            callback(new Error('Error de CORS'))
        }
    }
}
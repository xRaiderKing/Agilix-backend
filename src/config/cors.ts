import { CorsOptions } from 'cors'

export const corsConfig: CorsOptions = {
  origin: function(origin, callback) {
    const whitelist = [
      "https://agreeable-sand-0eff0741e.2.azurestaticapps.net", // sin barra final
      process.env.FRONTEND_URL // asegúrate que esta también esté sin barra final
    ]

    // Permitir requests sin origen (como Postman, curl o tests)
    if (!origin) {
      return callback(null, true)
    }

    if (whitelist.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Error de CORS: Origen no permitido'))
    }
  }
}

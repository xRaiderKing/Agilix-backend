import { transport } from "../config/nodemailer"

interface IEmail {
    email: string,
    name: string,
    token: string
}

export class AuthEmail{
    static sendConfirmationEmail = async (user : IEmail) =>{
         // Envio de emails
                   await transport.sendMail({
                    from: 'Agilix <admin@agilix.com>',
                    to: user.email,
                    subject: 'Agilix - Confirma tu cuenta',
                    text: 'Agilix - Confirma tu cuenta',
                    html: `<p> Hola ${user.name}, has creado tu cuenta en Agilix, ya casi esta
                    todo listo, solo debes de confirmar tu cuenta </p>
                    <p> Visita el siguiente enlace:</p>
                    <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar cuenta</a>
                    <p>E ingresa el codigo: <b>${user.token}</b></p>
                    <p>Este token expira en 10 minutos</p>
                    `
                   })

                   console.log('Mensaje enviado')
    }

    // Reset de contraseña
    static sendPasswordResetToken = async (user : IEmail) =>{
         // Envio de emails
                   await transport.sendMail({
                    from: 'Agilix <admin@agilix.com>',
                    to: user.email,
                    subject: 'Agilix - Restablece tu contraseña',
                    text: 'Agilix - Restablece tu contraseña',
                    html: `<p> Hola ${user.name}, has solicitado un restablecimiento de contraseña.</p>
                    <p> Visita el siguiente enlace:</p>
                    <a href="${process.env.FRONTEND_URL}/auth/new-password">Restablecer Contraseña</a>
                    <p>E ingresa el codigo: <b>${user.token}</b></p>
                    <p>Este token expira en 10 minutos</p>
                    `
                   })

                   console.log('Mensaje enviado')
    }
    
}
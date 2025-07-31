import type { Request, Response } from "express"
import bcrypt from 'bcrypt'
import User from "../models/User"
import { checkPassword, hashPassword } from "../utils/auth"
import Token from "../models/Token"
import { generateToken } from "../utils/token"
import { AuthEmail } from "../emails/AuthEmail"
import { generateJWT } from "../utils/jwt"

// Inicio del controlador de Autenticacion
export class AuthController {

    // Crear una cuenta
    static createAccount = async (req: Request, res: Response) => {
        try {

            const { password, email } = req.body
            // Prevenir duplicados
            const userExists = await User.findOne({email})
            if (userExists) {
                const error = new Error("Este correo electronico, ya ha sido registrado.")
                return res.status(409).json({ error: error.message })
            }

            // Crea el usuario
            const user = new User(req.body)

            // Hash password
            user.password = await hashPassword(password)

            // Generar token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // Envio de emails
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])

            res.send('Cuenta creada, revisa tu email para confirmarla')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    // Confirmar cuenta
    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body
            const tokenExists = await Token.findOne({ token })

            // Si no existe el token
            if (!tokenExists) {
                const error = new Error("Token no válido.")
                return res.status(404).json({ error: error.message })
            }

            const user = await User.findById(tokenExists.user)
            user.confirmed = true

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])
            res.send('Cuenta confirmada correctamente')

        }
        catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    // Iniciar Sesión / Login
    static login = async (req: Request, res: Response) => {
        try {

            const { email, password } = req.body
            const user = await User.findOne({ email })

            // Si no existe el correo
            if (!user) {
                const error = new Error("Usuario no encontrado")
                return res.status(404).json({ error: error.message })
            }
            // Si no esta confirmado la cuenta
            if (!user.confirmed) {
                const token = new Token()
                token.user = user.id
                token.token = generateToken()
                await token.save()
                // Enviar email
                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                })



                const error = new Error("La cuenta no ha sido confirmada, hemos enviado un e-mail de confirmación")
                return res.status(401).json({ error: error.message })
            }

            // Revisar si la contraseña es correcta
            const isPasswordCorrect = await checkPassword(password, user.password)
            if(!isPasswordCorrect){
                const error = new Error("Password Incorrecto")
                return res.status(401).json({ error: error.message })
            }

            const token = generateJWT({id:user._id})
            res.send(token)



        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    // volver a mandar el token
    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {

            const { email } = req.body
            // Usuario Exsite
            const user = await User.findOne({email})
            if (!user) {
                const error = new Error("El Usuario no esta registrado")
                return res.status(404).json({ error: error.message })
            }

            if(user.confirmed){
                const error = new Error("El Usuario ha confirmado su cuenta")
                return res.status(409).json({ error: error.message })
            }

            // Generar token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // Envio de emails
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])

            res.send('Se envió un nuevo token a tu e-mail')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        try {

            const { email } = req.body
            // Usuario Exsite
            const user = await User.findOne({email})
            if (!user) {
                const error = new Error("El Usuario no esta registrado")
                return res.status(404).json({ error: error.message })
            }

            // Generar token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            await token.save()

            // Envio de emails
            AuthEmail.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token
            })
            res.send('Revisa tu e-mail para instrucciones')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    // Confirmar Token
    static validateToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body
            const tokenExists = await Token.findOne({ token })

            // Si no existe el token
            if (!tokenExists) {
                const error = new Error("Token no válido.")
                return res.status(404).json({ error: error.message })
            }

            
            res.send('Token Valido, Define tu nueva contraseña')

        }
        catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    // Actualizar contraseña
    static updatePasswordWithToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.params
            const { password } = req.body
            const tokenExists = await Token.findOne({ token })

            // Si no existe el token
            if (!tokenExists) {
                const error = new Error("Token no válido.")
                return res.status(404).json({ error: error.message })
            }

            const user = await User.findById(tokenExists.user)
            user.password = await hashPassword(password)

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])

            
            res.send('La contraseña se modificó correctamente')

        }
        catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    // Autenticación redirección
    static user = async (req: Request, res: Response) => {
        return res.json(req.user)
    }


}
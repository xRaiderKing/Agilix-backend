import type { Request, Response } from "express"
import User from "../models/User"
import Project from "../models/Project"

export class TeamMemberController {

    // Encontrar colaboradores por email
    static findMemberbyEmail = async (req: Request, res: Response) => {
        const { email } = req.body

        // Usuario encontrado
        const user = await User.findOne({ email }).select('id name email')
        if (!user) {
            const error = new Error("Usuario no encontrado")
            return res.status(404).json({ error: error.message })
        }

        res.json(user)
    }

    // Encontrar miembros del equipo
    static getProjecTeam = async (req: Request, res: Response) => {
        const project = await (await Project.findById(req.project.id)).populate({ path: 'team', select: 'id email name' })

        res.json(project.team)
    }

    // Añdiendo personas al proyecto
    static addMemberById = async (req: Request, res: Response) => {
        const { id } = req.body

        // Usuario encontrado
        const user = await User.findById(id).select('id')
        if (!user) {
            const error = new Error("Usuario no encontrado")
            return res.status(404).json({ error: error.message })
        }
        if (req.project.team.some(team => team.toString() === user.id.toString())) {
            const error = new Error("El usuario ya existe en el proyecto")
            return res.status(409).json({ error: error.message })
        }

        req.project.team.push(user.id)
        await req.project.save()
        res.send('Usuario agregado al proyecto correctamente')
    }

    // Eliminar miembros de un proyecto
    static removeMemberById = async (req: Request, res: Response) => {
        const { userId } = req.params;
        const projectId = req.project._id;

        // Verificamos que el proyecto existe y contiene al usuario
        const project = await Project.findOne({ _id: projectId, team: userId });

        if (!project) {
            return res.status(404).json({ error: "Este usuario no pertenece al proyecto" });
        }

        // Eliminamos de forma atómica con $pull
        await Project.findByIdAndUpdate(
            projectId,
            { $pull: { team: userId } },
            { new: true }
        );

        return res.send("Usuario eliminado del proyecto correctamente");
    };



}
import type { Request, Response } from 'express';
import Project from '../models/Project';

export class ProjectController {
    // Crear un nuevo proyecto
    static async createProject(req: Request, res: Response) {
        const project = new Project(req.body);

        // Asigna manager
        project.manager = req.user.id

        try {
            await project.save();
            res.send("Proyecto creado correctamente");
        } catch (error) {
            console.log(error);
            res.status(500).send("Error al crear el proyecto");
        }
    }
    // Obtener todos los proyects
    static async getAllProjects(req: Request, res: Response) {
        try {
            const projects = await Project.find({
                $or: [
                    { manager: { $in: req.user.id } },
                    {team: {$in: req.user.id}}
                ]
            }).populate('manager', '_id email name')
            res.json(projects)
        } catch (error) {
            console.log(error);
            res.status(500).send("Error al obtener los proyectos");
        }
    }
    // Obtener un proyecto por ID
    static async getProjectById(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const project = await Project.findById(id).populate('tasks');
            if (!project) {
                const error = new Error('Proyecto no encontrado')
                return res.status(404).json({ error: error.message })
            }

            if (project.manager.toString() !== req.user.id.toString() && !project.team.includes(req.user.id)) {
                const error = new Error('Acción no valida')
                return res.status(404).json({ error: error.message })
            }
            res.json(project);
        } catch (error) {
            console.log(error);
            res.status(500).send("Error al obtener el proyecto");
        }
    }
    // Actualizar un proyecto por ID
    static async updateProjectById(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const project = await Project.findById(id);
            if (!project) {
                return res.status(404).send("Proyecto no encontrado");
            }

            if (project.manager.toString() !== req.user.id.toString()) {
                const error = new Error('Solo el Manager puede actualizar un proyecto')
                return res.status(404).json({ error: error.message })
            }

            project.projectName = req.body.projectName;
            project.clientName = req.body.clientName;
            project.description = req.body.description;
            await project.save();
            res.send("Proyecto actualizado correctamente");
        } catch (error) {
            console.log(error);
            res.status(500).send("Error al actualizar el proyecto");
        }
    }

    // Eliminar un proyecto por ID
    static deleteProjectById = async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const project = await Project.findById(id);

            if (!project) {
                const error = new Error("Proyecto no encontrado");
                return res.status(404).json({ error: error.message });
            }

            if (project.manager.toString() !== req.user.id.toString()) {
                const error = new Error('Solo el Manager puede eliminar el proyecto')
                return res.status(404).json({ error: error.message })
            }

            await project.deleteOne();
            res.send("Proyecto eliminado correctamente");
        } catch (error) {
            console.log(error);
            res.status(500).send("Error al eliminar el proyecto");
        }
    }

}
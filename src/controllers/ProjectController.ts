import type { Request, Response } from 'express';
import Project from '../models/Project';

export class ProjectController {
// Crear un nuevo proyecto
    static async createProject(req: Request, res: Response) {
        const project = new Project(req.body);
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
            const projects = await Project.find();
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
            const project = await Project.findById(id);
            if (!project) {
                return res.status(404).send("Proyecto no encontrado");
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
    static async deleteProjectById(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const project = await Project.findByIdAndDelete(id);
            if (!project) {
                return res.status(404).send("Proyecto no encontrado");
            }
            res.send("Proyecto eliminado correctamente");
        } catch (error) {
            console.log(error);
            res.status(500).send("Error al eliminar el proyecto");
        }
    }

}
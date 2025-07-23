import type{ Request, Response, NextFunction } from 'express'
import Project, { IProject } from '../models/Project';

declare global{
    namespace Express {
        interface Request {
            project: IProject
        }
    }
}

export async function ProjectExists(req: Request, res: Response, next: NextFunction){
    try{

        const { projectId } = req.params;
        const project = await Project.findById(projectId)

        if (!project) {
            return res.status(404).send("Proyecto no encontrado");
        }

        req.project = project

        next()

    }catch(error){
        console.error("Error en la validación del proyecto:", error);
        res.status(500).json({ Error: "Error en la validación del proyecto" })
    }
}
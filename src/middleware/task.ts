import type { Request, Response, NextFunction } from 'express'
import Task, { ITask } from '../models/Task';

declare global {
    namespace Express {
        interface Request {
            task: ITask
        }
    }
}

export async function TaskExists(req: Request, res: Response, next: NextFunction) {
    try {

        const { taskId } = req.params;
        const task = await Task.findById(taskId)

        if (!task) {
            return res.status(404).send("Tarea no encontrado");
        }

        req.task = task

        next()

    } catch (error) {
        console.error("Error en la validación del proyecto:", error);
        res.status(500).json({ Error: "Error en la validación del proyecto" })
    }
}

export function taskBelongToProject(req: Request, res: Response, next: NextFunction) {
    if (req.task.project.toString() !== req.project.id.toString()) {
        const error = new Error('Acción no valida')
        return res.status(400).json({ error: error.message});
    }
    next()
}

export function hasAuthorization(req: Request, res: Response, next: NextFunction) {
    if (req.user.id.toString() !== req.project.manager.toString()) {
        const error = new Error('Acción no valida')
        return res.status(400).json({ error: error.message});
    }
    next()
}
import type { Request, Response } from 'express';
import Task from '../models/Task';


export class TaskController {
    // Crear una nueva tarea
    static async createTask(req: Request, res: Response) {
        try {
            const task = new Task(req.body)
            task.project = req.project.id
            req.project.tasks.push(task.id)
            await Promise.allSettled([task.save(), req.project.save()])
            return res.status(201).send("Tarea creada exitosamente");

        } catch (error) {
            console.log(error)
        }
    }
    // Obtener todas las tareas de un proyecto
    static async getProjectTasks(req: Request, res: Response) {
        try {
            const tasks = await Task.find({ project: req.project.id }).populate('project')
            res.status(200).json(tasks)
        } catch (error) {
            res.status(500).json({ Error: "Error al obtener las tareas del proyecto" })
            console.error("Error al obtener las tareas del proyecto:", error);

        }
    }
    // Obtener tarea por su ID

    static async getTaskById(req: Request, res: Response) {
        try {
            const task = await Task.findById(req.task.id)
            .populate({ path: 'completedBy.user', select: '_id name email' })
            .populate({path: 'notes', populate: {path: 'createdBy', select: '_id name email'}})

            res.json(task);
        } catch (error) {
            console.error("Error al obtener la tarea por ID:", error);
            res.status(500).json({ Error: "Error al obtener la tarea por ID" });

        }
    }

    // Actualizar una tarea por ID
    static async updateTask(req: Request, res: Response) {
        try {
            req.task.name = req.body.name;
            req.task.description = req.body.description;
            await req.task.save();
            res.send("Tarea actualizada exitosamente");
        } catch (error) {
            console.error("Error al obtener la tarea por ID:", error);
            res.status(500).json({ Error: "Error al obtener la tarea por ID" });

        }
    }

    // Eliminar una tarea por ID
    static async deleteTask(req: Request, res: Response) {
        try {
            req.project.tasks = req.project.tasks.filter(task => task.toString() !== req.task.id.toString())

            // Eliminar la tarea y actualizar el proyecto
            await Promise.allSettled([req.task.deleteOne(), req.project.save()]);


            res.send("Tarea eliminada exitosamente");
        } catch (error) {
            console.error("Error al obtener la tarea por ID:", error);
            res.status(500).json({ Error: "Error al obtener la tarea por ID" });

        }
    }

    // Actualizar el estado de un proyecto por ID
    static async updateTaskStatus(req: Request, res: Response) {
        try {
            const { status } = req.body
            req.task.Status = status

            const data = {
                user: req.user.id,
                status
            }

            req.task.completedBy.push(data)

            await req.task.save();
            res.send('Se ha actualizado el estado de la Tarea');

        } catch (error) {
            console.log(error);
            res.status(500).send("Error al actualizar el estado");
        }
    }


}
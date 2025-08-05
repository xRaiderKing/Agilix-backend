import type { Request, Response } from 'express';
import Project from '../models/Project';
import Task from '../models/Task';

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
                    { team: { $in: req.user.id } }
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
        try {

            req.project.projectName = req.body.projectName;
            req.project.clientName = req.body.clientName;
            req.project.description = req.body.description;
            await req.project.save();
            res.send("Proyecto actualizado correctamente");
        } catch (error) {
            console.log(error);
            res.status(500).send("Error al actualizar el proyecto");
        }
    }

    // Eliminar un proyecto por ID
    static deleteProjectById = async (req: Request, res: Response) => {
        try {
            await req.project.deleteOne();
            res.send("Proyecto eliminado correctamente");
        } catch (error) {
            console.log(error);
            res.status(500).send("Error al eliminar el proyecto");
        }
    }

    // Obtener estadísticas del dashboard para managers
    static async getManagerDashboard(req: Request, res: Response) {
        try {
            // Obtener proyectos donde el usuario es manager
            const managedProjects = await Project.find({
                manager: req.user.id
            }).select('_id');

            if (managedProjects.length === 0) {
                return res.status(403).json({ error: 'No tienes permisos de manager en ningún proyecto' });
            }

            const projectIds = managedProjects.map(project => project._id);

            // Obtener estadísticas de tareas
            const taskStats = await Task.aggregate([
                {
                    $match: {
                        project: { $in: projectIds }
                    }
                },
                {
                    $group: {
                        _id: '$Status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            // Organizar las estadísticas
            const stats = {
                openStories: 0,
                closedStories: 0,
                totalProjects: managedProjects.length
            };

            taskStats.forEach(stat => {
                if (stat._id === 'completed') {
                    stats.closedStories = stat.count;
                } else {
                    stats.openStories += stat.count;
                }
            });

            // Obtener estadísticas por proyecto
            const projectStats = await Task.aggregate([
                {
                    $match: {
                        project: { $in: projectIds }
                    }
                },
                {
                    $group: {
                        _id: {
                            project: '$project',
                            status: '$Status'
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: '$_id.project',
                        stats: {
                            $push: {
                                status: '$_id.status',
                                count: '$count'
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'projects',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'project'
                    }
                },
                {
                    $unwind: '$project'
                },
                {
                    $project: {
                        projectName: '$project.projectName',
                        stats: 1
                    }
                }
            ]);

            res.json({
                summary: stats,
                projectBreakdown: projectStats
            });
        } catch (error) {
            console.log(error);
            res.status(500).send("Error al obtener estadísticas del dashboard");
        }
    }
}
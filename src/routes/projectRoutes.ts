import { Router } from 'express'
import { body, param } from 'express-validator'
import { ProjectController } from '../controllers/ProjectController'
import { handleInputsErrors } from '../middleware/validations'
import { TaskController } from '../controllers/TaskController'
import { ProjectExists } from '../middleware/project'
import { taskBelongToProject, TaskExists } from '../middleware/task'
import { authenticate } from '../middleware/auth'

const router = Router()

// Crear proyectos
router.post('/', 
    // Validaciones
    authenticate,
    body('projectName').notEmpty().withMessage('El nombre del proyecto es obligatorio'),
    body('clientName').notEmpty().withMessage('El nombre del cliente es obligatorio'),
    body('description').notEmpty().withMessage('La descripción es obligatoria'), 
    handleInputsErrors,
    // Controlador
    ProjectController.createProject
)

// Traer todos los proyectos
router.get('/', ProjectController.getAllProjects)

// Traer un proyecto por ID
router.get('/:id', 
    // Validaciones
    param('id').isMongoId().withMessage('ID inválido'), handleInputsErrors,
    // Controlador
    ProjectController.getProjectById)

// Actualizar un proyecto por ID
router.put('/:id',
    // Validaciones
    param('id').isMongoId().withMessage('ID inválido'), 
    body('projectName').notEmpty().withMessage('El nombre del proyecto es obligatorio'),
    body('clientName').notEmpty().withMessage('El nombre del cliente es obligatorio'),
    body('description').notEmpty().withMessage('La descripción es obligatoria'),handleInputsErrors,
    // Controlador
    ProjectController.updateProjectById
)

// Eliminar un proyecto por ID
router.delete('/:id',
    // Validaciones
    param('id').isMongoId().withMessage('ID inválido'), handleInputsErrors,
    // Controlador
    ProjectController.deleteProjectById
)


/* Rutas para las TASK = TAREAS */
// Simplificación de la validación
router.param('projectId', ProjectExists)

// Crear una nueva tarea
router.post('/:projectId/tasks',
     //Validaciones
     body('name').notEmpty().withMessage('El nombre de la tarea es obligatorio'),
     body('description').notEmpty().withMessage('La descripción de la tarea es obligatoria'), 
     handleInputsErrors,
    // Controlador
    TaskController.createTask
)

// Obtener todas las tareas de un proyecto
router.get('/:projectId/tasks',
    // Controlador
    TaskController.getProjectTasks
)

// Validación donde empieza el taskID para validar que la tarea exista
router.param('taskId', TaskExists)
// Validación para verificar que la tarea pertenece al proyecto
router.param('taskId', taskBelongToProject)

// Obtener las tareas por ID de un proyecto
router.get('/:projectId/tasks/:taskId',
    // Validaciones
    param('taskId').isMongoId().withMessage('ID inválido'),
    handleInputsErrors,
    // Controlador
    TaskController.getTaskById
)

// Actualizar una tarea por ID
router.put('/:projectId/tasks/:taskId',
    // Validaciones
    param('taskId').isMongoId().withMessage('ID inválido'),
    body('name').notEmpty().withMessage('El nombre de la tarea es obligatorio'),
    body('description').notEmpty().withMessage('La descripción de la tarea es obligatoria'),
    handleInputsErrors,
    // Controlador
    TaskController.updateTask
)

// Eliminar una tarea por ID
router.delete('/:projectId/tasks/:taskId',
    // Validaciones
    param('taskId').isMongoId().withMessage('ID inválido'),
    handleInputsErrors,
    // Controlador
    TaskController.deleteTask
)

// Actualizar el estado de una tarea por ID
router.post('/:projectId/tasks/:taskId/status',
    // Validaciones
    param('taskId').isMongoId().withMessage('ID inválido'),
    body('status').notEmpty().withMessage('El estado de la tarea es obligatorio'),
    handleInputsErrors,
    // Controlador
    TaskController.updateTaskStatus
)

export default router;
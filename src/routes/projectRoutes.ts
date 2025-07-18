import { Router } from 'express'
import { body, param } from 'express-validator'
import { ProjectController } from '../controllers/ProjectController'
import { handleInputsErrors } from '../middleware/validations'

const router = Router()

router.post('/', 
    // Validaciones
    body('projectName').notEmpty().withMessage('El nombre del proyecto es obligatorio'),
    body('clientName').notEmpty().withMessage('El nombre del cliente es obligatorio'),
    body('description').notEmpty().withMessage('La descripción es obligatoria'), handleInputsErrors,
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
export default router;
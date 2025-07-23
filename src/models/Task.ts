import mongoose, {Schema, Document, Types} from "mongoose";

const taskStatus = {
    PENDING: "Pendiente",
    ON_HOLD: "En Espera",
    IN_PROGRESS: "En Progreso",
    UNDER_REVIEW: "En Revisión",
    COMPLETED: "Completada"
} as const

export type TaskStatus = typeof taskStatus[keyof typeof taskStatus];

export interface ITask extends Document {
    name: String
    description: String
    project: Types.ObjectId
    Status: TaskStatus

}

export const TaskSchema : Schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    project:{
        type: Types.ObjectId,
        ref: "Project",
        required: true
    },
    Status: {
        type: String,
        enum: Object.values(taskStatus),
        default: taskStatus.PENDING
    }
},{ timestamps: true })

const Task = mongoose.model<ITask>("Task", TaskSchema)
export default Task;
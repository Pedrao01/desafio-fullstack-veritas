import TaskCard from "./Tasks";
import type { Task } from "./types";

interface ColumnProps {
    title: string;
    status: Task["status"];
    tasks: Task[];
    onDelete: (id: string) => void;
    onMove: (id: string, status: Task["status"]) => void;
    onEdit: (task: Task) => void;
}

function Column({title, status, tasks, onDelete, onMove, onEdit}: ColumnProps) {
    const filteredTasks = tasks.filter(task => task.status === status)

    return (
        <div className="column">
            <h2>{title}</h2>
            {filteredTasks.map(task => (
                <div className="task" key={task.id}>
                    <TaskCard id={task.id} title={task.title} status={task.status} description={task.description} />
                    <select
                        value={task.status}
                        onChange={(e) => onMove(task.id, e.target.value as Task["status"])}
                    >
                        <option value="todo">Fazer</option>
                        <option value="in_progress">Em progresso</option>
                        <option value="done">Concluída</option>
                    </select>
                    <div className="button">
                        <button onClick={() => onDelete(task.id)}>Deletar</button>
                        <button onClick={() => onEdit(task)}>Editar</button>
                    </div>
                    
                </div>
                
            ))}
            
        </div>
    )
}

export default Column
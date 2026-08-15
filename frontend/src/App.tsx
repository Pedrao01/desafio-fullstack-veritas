import { useEffect, useState } from 'react'
import './App.css'
import Column from './Column';
import { getTasks, createTask, deleteTask, updateTask } from './api';
import type { Task } from './types';

function App() {

  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [editingTask, setEditionTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<Task["status"]>("todo");

  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    getTasks()
      .then((data) => setTasks(data))
      .catch(() => setError("Não foi possivel carregar as tarefas."))
      .finally(() => setLoading(false))

  }, [])

  const handleDeleteTask = async(id: string) => {
    const deleted = await deleteTask(id)
    const t = tasks.filter(t => t.id !== deleted.id)
    setTasks(t)
  }
  
  const handleUpdateTask = async(id: string, status: "todo" | "in_progress" | "done") => {
    const updatedTask = await updateTask(id, status)
    const t = tasks.map(task => {
      if (task.id === updatedTask.id) {
        return updatedTask
      }
      return task
    })
    setTasks(t)
  }

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null)
    try {
      const task = await createTask(title, "todo", description)
      setTasks([...tasks, task])

      setTitle('');
      setDescription('');
    } catch (err){
      setFormError("Não foi possivel criar a tarefa.")
    }
  }

  const handleEditTask = (task: Task) => {
    setEditionTask(task)
    setEditTitle(task.title)
    setEditDescription(task.description)
    setEditStatus(task.status)
  }

  const handleSaveTask = async() => {
    if (!editingTask) return;
    const updatedTask = await updateTask(editingTask.id, editStatus, editTitle, editDescription)
    const ts = tasks.map((tasks) => {
      if (tasks.id === updatedTask.id) {
        return updatedTask;
      }
      return tasks
    })
    setTasks(ts)
    setEditionTask(null)
  }
  
  if (loading) return <p>Carregando tarefas...</p>
  if (error) return <p>{error}</p>
  return (
    <div className='formulario-container'>
      <div className='app-container'>
      <div className='board'>
        <Column title="A Fazer" status="todo" tasks={tasks} onDelete={handleDeleteTask} onMove={handleUpdateTask} onEdit={handleEditTask}/>
        <Column title='Em progresso' status='in_progress' tasks={tasks} onDelete={handleDeleteTask} onMove={handleUpdateTask} onEdit={handleEditTask}/>
        <Column title='Concluída' status='done' tasks={tasks} onDelete={handleDeleteTask} onMove={handleUpdateTask} onEdit={handleEditTask}/>
      </div> 
    </div>

      <form className='form' onSubmit={handleSubmit}>
        <div className='campo-grupo'>
          <label>Titulo</label>
          <input
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='Título da Tarefa'
          />
          <label>Descrição</label>
          <input
          type='text'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder='Description (opcional)'
          />
        </div>

        {formError && <p className='form-error'>{formError}</p>}

        <div className='button'>
          <button type='submit'>Adicionar</button>
        </div>    
      </form>

      {editingTask && (
        <div className="modal-overlay">
          <div className='modal'>
            <h2>Editar Tarefa</h2>
            <div>
              <input
              type='text'
              value={editTitle}
              onChange={(e) => {setEditTitle(e.target.value)}}
            />
            </div>
            <div>
              <input
              type="text"
              value={editDescription}
              onChange={(e) => {setEditDescription(e.target.value)}}
              />
            </div>
            <div className='button'>
              <button type="button" onClick={handleSaveTask}>Salvar</button>
              <button type="button" onClick={() => setEditionTask(null)}>Cancelar</button>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );  
}

export default App

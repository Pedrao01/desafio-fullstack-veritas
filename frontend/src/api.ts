import type { Task } from './types'

const API_URL = 'http://localhost:8080';

export const getTasks = async (): Promise<Task[]> => {
    const r = await fetch(`${API_URL}/tasks`)

    return r.json()
}

export const createTask = async ( title: string, status: string, description: string = ''): Promise<Task> => {
    const r = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, status, description })
    })

    if (!r.ok) {
        throw new Error("Erro ao criar uma tarefa")
    }

    return r.json()
}

export const deleteTask = async ( id: string): Promise<Task> => {
    const r = await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
    })

    return r.json()
}

export const updateTask = async (id: string, status?: string, title?: string, description?:string): Promise<Task> => {
    const r = await fetch(`${API_URL}/tasks/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({title, description, status})
    })

    return r.json()
}
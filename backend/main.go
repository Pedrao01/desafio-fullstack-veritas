package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"slices"
	"sync"

	"github.com/google/uuid"
)

type Task struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Status      string `json:"status"`
	Description string `json:"description"`
}

var tasks = []Task{
	{ID: uuid.New().String(), Title: "Estudar Gooooooooo", Status: "todo", Description: "Estudar sobre struct"},
	{ID: uuid.New().String(), Title: "Estudar Ingles", Status: "todo", Description: "Fazer misssão doulingo"},
}

var mu sync.Mutex

func withCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		next(w, r)
	}
}

func handleListTasks(w http.ResponseWriter, r *http.Request) {
	mu.Lock()
	defer mu.Unlock()

	json.NewEncoder(w).Encode(tasks)
}

func handleCreateTask(w http.ResponseWriter, r *http.Request) {
	mu.Lock()
	defer mu.Unlock()

	var t Task
	json.NewDecoder(r.Body).Decode(&t)
	if t.Title == "" {
		http.Error(w, "O titulo é obrigatório", http.StatusBadRequest)
		return
	}

	t.ID = uuid.New().String()
	tasks = append(tasks, t)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(t)
}

func findTaskIndex(id string) int {
	for i, task := range tasks {
		if task.ID == id {
			return i
		}
	}
	return -1
}

func handleDeleteTask(w http.ResponseWriter, r *http.Request) {
	mu.Lock()
	defer mu.Unlock()

	id := r.PathValue("id")
	i := findTaskIndex(id)
	if i == -1 {
		http.Error(w, "Invalid ID", http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(tasks[i])
	tasks = slices.Delete(tasks, i, i+1)
}

func handleUpdateTask(w http.ResponseWriter, r *http.Request) {
	mu.Lock()
	defer mu.Unlock()

	id := r.PathValue("id")
	i := findTaskIndex(id)

	if i == -1 {
		http.Error(w, "ID inválido", http.StatusNotFound)
		return
	}
	var newData struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		Status      string `json:"status"`
	}

	json.NewDecoder(r.Body).Decode(&newData)

	if newData.Title != "" {
		tasks[i].Title = newData.Title
	}
	if newData.Description != "" {

		tasks[i].Description = newData.Description
	}
	if newData.Status != "" {
		if newData.Status != "todo" && newData.Status != "in_progress" && newData.Status != "done" {
			http.Error(w, "Status inválido", http.StatusBadRequest)
			return
		}
		tasks[i].Status = newData.Status
	}

	json.NewEncoder(w).Encode(tasks[i])
}

func handleOptions(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
}

func main() {
	http.HandleFunc("GET /tasks", withCORS(handleListTasks))
	http.HandleFunc("POST /tasks", withCORS(handleCreateTask))
	http.HandleFunc("PUT /tasks/{id}", withCORS(handleUpdateTask))
	http.HandleFunc("DELETE /tasks/{id}", withCORS(handleDeleteTask))
	http.HandleFunc("OPTIONS /tasks/{id}", withCORS(handleOptions))
	http.HandleFunc("OPTIONS /tasks", withCORS(handleOptions))

	fmt.Println("server running on port 8080...")
	http.ListenAndServe(":8080", nil)
}

package handler

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

// CreateItem adds a new item
func CreateItem(w http.ResponseWriter, r *http.Request) {
	var item struct {
		Name string
		Qty  int
	}
	json.NewDecoder(r.Body).Decode(&item)
	// TODO: save to DB…
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(item)
}

// ListItems shows all items
func ListItems(w http.ResponseWriter, r *http.Request) {
	// TODO: fetch from DB…
	items := []map[string]interface{}{
		{"id": "1", "name": "Widget", "qty": 10},
	}
	json.NewEncoder(w).Encode(items)
}

// GetItem returns one item
func GetItem(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	// TODO: fetch by id…
	json.NewEncoder(w).Encode(map[string]interface{}{"id": id, "name": "Widget", "qty": 10})
}

// DeleteItem removes an item
func DeleteItem(w http.ResponseWriter, r *http.Request) {
	// TODO: delete in DB…
	w.WriteHeader(http.StatusNoContent)
}

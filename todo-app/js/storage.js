// Storage Module - Handle localStorage operations

const STORAGE_KEY = 'todoAppData';
const SETTINGS_KEY = 'todoAppSettings';

class TodoStorage {
  // Save all todos
  static saveTodos(todos) {
    try {
      const data = this.getAllData();
      data.todos = todos;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('✅ Todos saved successfully');
    } catch (error) {
      console.error('❌ Error saving todos:', error);
    }
  }

  // Get all todos
  static getTodos() {
    try {
      const data = this.getAllData();
      return data.todos || [];
    } catch (error) {
      console.error('❌ Error getting todos:', error);
      return [];
    }
  }

  // Add a new todo
  static addTodo(todo) {
    try {
      const todos = this.getTodos();
      todos.push(todo);
      this.saveTodos(todos);
      return todo;
    } catch (error) {
      console.error('❌ Error adding todo:', error);
      return null;
    }
  }

  // Update a todo
  static updateTodo(id, updates) {
    try {
      const todos = this.getTodos();
      const index = todos.findIndex(t => t.id === id);
      if (index !== -1) {
        todos[index] = { ...todos[index], ...updates, updatedAt: new Date().toISOString() };
        this.saveTodos(todos);
        return todos[index];
      }
      return null;
    } catch (error) {
      console.error('❌ Error updating todo:', error);
      return null;
    }
  }

  // Delete a todo
  static deleteTodo(id) {
    try {
      const todos = this.getTodos();
      const filtered = todos.filter(t => t.id !== id);
      this.saveTodos(filtered);
      console.log('✅ Todo deleted');
      return true;
    } catch (error) {
      console.error('❌ Error deleting todo:', error);
      return false;
    }
  }

  // Get todos by filter
  static getTodosByFilter(filter) {
    const todos = this.getTodos();
    switch (filter) {
      case 'completed':
        return todos.filter(t => t.completed);
      case 'active':
        return todos.filter(t => !t.completed);
      default:
        return todos;
    }
  }

  // Search todos
  static searchTodos(query) {
    const todos = this.getTodos();
    return todos.filter(t =>
      t.title.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Get statistics
  static getStats() {
    const todos = this.getTodos();
    const completed = todos.filter(t => t.completed).length;
    return {
      total: todos.length,
      completed,
      pending: todos.length - completed,
      completionRate: todos.length === 0 ? 0 : Math.round((completed / todos.length) * 100),
    };
  }

  // Save settings
  static saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('❌ Error saving settings:', error);
    }
  }

  // Get settings
  static getSettings() {
    try {
      const settings = localStorage.getItem(SETTINGS_KEY);
      return settings ? JSON.parse(settings) : { darkMode: false };
    } catch (error) {
      console.error('❌ Error getting settings:', error);
      return { darkMode: false };
    }
  }

  // Get all data
  static getAllData() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : { todos: [] };
    } catch (error) {
      console.error('❌ Error getting all data:', error);
      return { todos: [] };
    }
  }

  // Export data
  static exportData() {
    try {
      const data = {
        todos: this.getTodos(),
        settings: this.getSettings(),
        exportedAt: new Date().toISOString(),
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('❌ Error exporting data:', error);
      return null;
    }
  }

  // Import data
  static importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.todos && Array.isArray(data.todos)) {
        this.saveTodos(data.todos);
        if (data.settings) {
          this.saveSettings(data.settings);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error importing data:', error);
      return false;
    }
  }

  // Clear all data
  static clearAll() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SETTINGS_KEY);
      console.log('✅ All data cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      return false;
    }
  }
}

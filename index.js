const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const env = require('dotenv');

env.config(); // Load environment variables
const app = express();
const port = process.env.PORT || 3000; // Use environment variable or default to 3000

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/todo-app'; // Use environment variable for MongoDB URI
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Task schema and model
const taskSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const Task = mongoose.model('Task', taskSchema,'Tasks');

// Routes

// Fetch all tasks
app.get("", (req, res)=>{
    return res.send("Hello");
})
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    return res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching tasks' });
  }
});

// Add a new task
app.post('/tasks', async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  try {
    const newTask = new Task({
      _id: new Date().toISOString(), // Generate ID based on timestamp
      title,
    });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: 'Error adding task' });
  }
});

// Delete a task by ID
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting task' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

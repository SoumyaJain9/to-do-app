const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()
app.use(cors())
app.use(express.json())
const MONGO_URI = process.env.MONGO_URI
const JWT_SECRET = process.env.JWT_SECRET

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err))

// --- Schemas ---
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
})
const User = mongoose.model('User', userSchema)

const todoSchema = new mongoose.Schema({
  text: String,
  done: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
})
const Todo = mongoose.model('Todo', todoSchema)

// --- Auth routes ---
app.post('/auth/signup', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' })
    }
    const existing = await User.findOne({ username })
    if (existing) {
      return res.status(400).json({ message: 'Username already taken' })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({ username, password: hashedPassword })
    await user.save()
    res.status(201).json({ message: 'User created' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await User.findOne({ username })
    if (!user) return res.status(400).json({ message: 'Invalid credentials' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' })

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, username: user.username })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// --- Middleware: protects routes below ---
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ message: 'No token provided' })

  const token = authHeader.split(' ')[1] // "Bearer <token>"
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' })
  }
}

// --- Todo routes (require login, only return the logged-in user's todos) ---
app.get('/todos', requireAuth, async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.userId })
    res.json(todos)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/todos', requireAuth, async (req, res) => {
  try {
    const { text } = req.body
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Text is required' })
    }
    const todo = new Todo({ text, userId: req.userId })
    await todo.save()
    res.status(201).json(todo)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.patch('/todos/:id', requireAuth, async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, userId: req.userId })
    if (!todo) return res.status(404).json({ message: 'Not found' })
    todo.done = true
    await todo.save()
    res.json(todo)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.patch('/todos/:id/edit', requireAuth, async (req, res) => {
  try {
    const { text } = req.body
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Text is required' })
    }
    const todo = await Todo.findOne({ _id: req.params.id, userId: req.userId })
    if (!todo) return res.status(404).json({ message: 'Not found' })
    todo.text = text
    await todo.save()
    res.json(todo)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.delete('/todos/:id', requireAuth, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!todo) return res.status(404).json({ message: 'Not found' })
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})

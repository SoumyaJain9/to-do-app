
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()
app.use(cors())
app.use(express.json())
 const MONGO_URI = 'mongodb://todouser:Ipbank%401234@ac-8uqjuer-shard-00-00.mp3ma3p.mongodb.net:27017,ac-8uqjuer-shard-00-01.mp3ma3p.mongodb.net:27017,ac-8uqjuer-shard-00-02.mp3ma3p.mongodb.net:27017/todoapp?ssl=true&replicaSet=atlas-zjt182-shard-0&authSource=admin&retryWrites=true&w=majority&appName=todoapp'

 mongoose.connect(MONGO_URI)
 .then(()=> console.log('Connected to MongoDB'))
 .catch(err=> console.error('MongoDB connection error:',err))

 const todoSchema= new mongoose.Schema({
   text:String,
   done:{type:Boolean,default:false}
 })
 const Todo=mongoose.model('Todo', todoSchema)

 app.get('/todos',async (req, res) => {
   try{
      const todos=await Todo.find()
      res.json(todos)
   }catch(err){
      res.status(500).json({message:'Server error'})
   }
 })

 app.post('/todos',async (req,res)=> {
   try{
      const {text} = req.body
    if (!text || text.trim()===''){
      return res.status(400).json({message:'Text is required'})
    }
     const todo=new Todo({text})
    await todo.save()
    res.status(201).json(todo)

   }catch(err){
      res.status(500).json({message:'Server error'})
   }
   
 })

 app.put('/todos/:id',async (req,res)=>{
    const todo= await Todo.findById(req.params.id)
    if (!todo) return res.status(404).json({message:'Not found'})
    todo.done=true
   await todo.save()
    res.json(todo)
 })
 app.patch('/todos/:id', async (req, res) => {
  const todo = await Todo.findById(req.params.id)
  if (!todo) return res.status(404).json({ message: 'Not found' })
  todo.done = true
  await todo.save()
  res.json(todo)
})

 app.delete('/todos/:id', async (req, res) => {
  const todo = await Todo.findByIdAndDelete(req.params.id)
  if (!todo) return res.status(404).json({ message: 'Not found' })
  res.json({ message: 'Deleted' })
})

 app.listen(3000,()=>{
    console.log('Server running on http://localhost:3000')
 }
)
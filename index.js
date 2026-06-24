const express = require('express')
const app = express()

app.use(express.json())
 let todos = []
 let nextID=1

 app.get('/todos', (req, res) => {
    res.json(todos)
 })

 app.post('/todos',(req,res)=> {
    const {text} = req.body
    const todo={id:nextID++, text, done:false}
    todos.push(todo)
    res.status(201).json(todo)
 })

 app.put('/todos/:id', (req,res)=>{
    const todo= todos.find(t=> t.id=== parseInt(req.params.id))
    if (!todo) return res.status(404).json({message:'Not found'})
    todo.done=true
    res.json(todo)
 })

 app.delete('/todos/:id', (req,res)=> {
    const index=todos.findIndex(t=> t.id=== parseInt(req.params.id))
    if (index===-1) return res.status(404).json({message:'Not found'})
        todos.splice(index,1)
    res.json({message:'Deleted'})
 })

 app.listen(3000,()=>{
    console.log('Server running on http://localhost:3000')
 }
)
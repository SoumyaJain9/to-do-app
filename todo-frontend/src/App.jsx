import { useEffect, useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:3000'

const cardColors = [
  'bg-primary-fixed-dim/30',
  'bg-secondary-container/20',
  'bg-[#fde33f]/30',
  'bg-[#ffaedd]/40',
  'bg-[#26fedc]/20',
]

function App() {
  const [todos, setTodos] = useState([])
  const [text, setText] = useState('')

  useEffect(() => {
    axios.get(`${API}/todos`).then(res => setTodos(res.data))
  }, [])

  const addTodo = async () => {
    if (!text) return
    const res = await axios.post(`${API}/todos`, { text })
    setTodos([...todos, res.data])
    setText('')
  }

  const markDone = async (id) => {
    const res = await axios.patch(`${API}/todos/${id}`, { done: true })
    setTodos(todos.map(todo => todo._id === id ? res.data : todo))
  }

  const deleteTodo = async (id) => {
    await axios.delete(`${API}/todos/${id}`)
    setTodos(todos.filter(todo => todo._id !== id))
  }

  return (
    <div className="min-h-screen bg-[#fcf9f8] text-on-surface font-sans"
      style={{ backgroundImage: 'radial-gradient(#ddbecd 1px, transparent 1px)', backgroundSize: '24px 24px' }}>

      <header className="sticky top-0 z-50 bg-background border-b-[3px] border-on-background shadow-[4px_4px_0px_0px_#1A1A1A]">
        <nav className="flex justify-between items-center w-full px-4 sm:px-8 py-3 max-w-[1000px] mx-auto">
          <span className="font-display text-xl sm:text-3xl font-extrabold text-primary uppercase tracking-tighter">
            Dumb Simple Todos
          </span>
        </nav>
      </header>

      <main className="max-w-[1000px] mx-auto px-4 sm:px-8 py-6 sm:py-12 flex flex-col lg:flex-row gap-6 relative">

        <section className="flex-grow w-full">
          <div className="bg-surface border-[3px] border-on-background shadow-[6px_6px_0px_0px_#1A1A1A] sm:shadow-[8px_8px_0px_0px_#1A1A1A] flex flex-col min-h-[400px] sm:min-h-[500px] overflow-hidden">
            <div className="bg-on-background text-surface p-3 sm:p-4 flex items-center gap-3 select-none">
              <span className="material-symbols-outlined text-lg sm:text-xl">description</span>
              <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest">TASKS_I_MIGHT_DO.txt</span>
            </div>

            <div className="p-4 sm:p-8 flex-grow flex flex-col gap-6">
              <div className="flex flex-col gap-3 sm:gap-4">
                {todos.map((todo, i) => (
                  <div
                    key={todo._id}
                    className={`group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-[3px] border-on-background transition-colors hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#1A1A1A] ${cardColors[i % cardColors.length]} ${todo.done ? 'opacity-50' : ''}`}
                  >
                    <button
                      onClick={() => markDone(todo._id)}
                      disabled={todo.done}
                      className={`w-7 h-7 sm:w-8 sm:h-8 shrink-0 border-[3px] border-on-background flex items-center justify-center transition-all hover:shadow-[2px_2px_0px_0px_#1A1A1A] ${todo.done ? 'bg-primary-container' : 'bg-surface'}`}
                    >
                      {todo.done && <span className="material-symbols-outlined text-primary font-bold text-base sm:text-lg">close</span>}
                    </button>

                    <span className={`flex-grow font-display text-base sm:text-xl font-bold text-on-surface break-words ${todo.done ? 'line-through' : ''}`}>
                      {todo.text}
                    </span>

                    <button
                      onClick={() => deleteTodo(todo._id)}
                      className="p-1 sm:p-2 shrink-0 text-on-surface-variant hover:text-error transition-transform hover:scale-110"
                    >
                      <span className="material-symbols-outlined text-lg sm:text-xl">delete</span>
                    </button>
                  </div>
                ))}
              </div>

              {todos.length === 0 && (
                <div className="mt-auto pt-8 border-t-[3px] border-on-background flex flex-col items-center justify-center gap-4 opacity-40">
                  <span className="material-symbols-outlined text-[48px] sm:text-[64px]">sticky_note_2</span>
                  <p className="font-mono text-xs text-center">NO TASKS. ADD SOME CHAOS BELOW.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="w-full lg:w-[300px] shrink-0 flex flex-col gap-6">
          <div className="bg-secondary-container p-5 sm:p-6 border-[3px] border-on-background shadow-[4px_4px_0px_0px_#1A1A1A]">
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-on-secondary-container mb-4 leading-tight">
              Add some more work?
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs text-on-secondary-container/70">WHAT'S THE VIBE?</label>
                <input
                  className="w-full bg-surface border-[3px] border-on-background p-3 focus:outline-none focus:shadow-[4px_4px_0px_0px_#006b5b] transition-shadow"
                  placeholder="Type here..."
                  type="text"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTodo()}
                />
              </div>
              <button
                onClick={addTodo}
                className="mt-2 w-full bg-on-background text-surface border-[3px] border-on-background p-3 sm:p-4 font-bold uppercase tracking-widest hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[6px_6px_0px_0px_#007261]"
              >
                Stick it!
              </button>
            </div>
          </div>

          <div className="bg-[#fde33f]/40 border-[3px] border-on-background p-5 sm:p-6 shadow-[4px_4px_0px_0px_#1A1A1A] flex flex-col gap-2 items-center text-center">
            <span className="material-symbols-outlined text-4xl text-secondary">mood</span>
            <p className="font-mono text-xs">CURRENT MOOD: PRODUCTIVE-ISH</p>
          </div>
        </aside>
      </main>
    </div>
  )
}

export default App
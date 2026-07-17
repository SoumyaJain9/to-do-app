import { useEffect, useState } from 'react'
import axios from 'axios'

const API = 'https://api.soumyajain.online'
const cardColors = [
  'bg-primary-fixed-dim/30',
  'bg-secondary-container/20',
  'bg-[#fde33f]/30',
  'bg-[#ffaedd]/40',
  'bg-[#26fedc]/20',
]

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [username, setUsername] = useState(localStorage.getItem('username') || '')

  const [authMode, setAuthMode] = useState('login') // 'login' or 'signup'
  const [authUsername, setAuthUsername] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')

  const [todos, setTodos] = useState([])
  const [text, setText] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  // Axios config with auth header attached
  const authHeader = { headers: { Authorization: `Bearer ${token}` } }

  useEffect(() => {
    if (token) {
      axios.get(`${API}/todos`, authHeader)
        .then(res => setTodos(res.data))
        .catch(() => handleLogout()) // token invalid/expired -> log out
    }
  }, [token])

  // --- Auth actions ---
  const handleAuthSubmit = async () => {
    setAuthError('')
    if (!authUsername || !authPassword) {
      setAuthError('Username and password required')
      return
    }
    try {
      if (authMode === 'signup') {
        await axios.post(`${API}/auth/signup`, { username: authUsername, password: authPassword })
        // after signup, log them in automatically
        const res = await axios.post(`${API}/auth/login`, { username: authUsername, password: authPassword })
        loginSuccess(res.data)
      } else {
        const res = await axios.post(`${API}/auth/login`, { username: authUsername, password: authPassword })
        loginSuccess(res.data)
      }
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Something went wrong')
    }
  }

  const loginSuccess = (data) => {
    setToken(data.token)
    setUsername(data.username)
    localStorage.setItem('token', data.token)
    localStorage.setItem('username', data.username)
    setAuthUsername('')
    setAuthPassword('')
  }

  const handleLogout = () => {
    setToken(null)
    setUsername('')
    setTodos([])
    localStorage.removeItem('token')
    localStorage.removeItem('username')
  }

  // --- Todo actions (all now send the auth header) ---
  const addTodo = async () => {
    if (!text) return
    const res = await axios.post(`${API}/todos`, { text }, authHeader)
    setTodos([...todos, res.data])
    setText('')
  }

  const markDone = async (id) => {
    const res = await axios.patch(`${API}/todos/${id}`, {}, authHeader)
    setTodos(todos.map(todo => todo._id === id ? res.data : todo))
  }

  const deleteTodo = async (id) => {
    await axios.delete(`${API}/todos/${id}`, authHeader)
    setTodos(todos.filter(todo => todo._id !== id))
  }

  const startEditing = (todo) => {
    setEditingId(todo._id)
    setEditText(todo.text)
  }

  const saveEdit = async (id) => {
    if (!editText.trim()) return
    const res = await axios.patch(`${API}/todos/${id}/edit`, { text: editText }, authHeader)
    setTodos(todos.map(todo => todo._id === id ? res.data : todo))
    setEditingId(null)
    setEditText('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  // --- LOGIN / SIGNUP SCREEN ---
  if (!token) {
    return (
      <div className="min-h-screen bg-[#fcf9f8] flex items-center justify-center px-4"
        style={{ backgroundImage: 'radial-gradient(#ddbecd 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        <div className="w-full max-w-sm bg-surface border-[3px] border-on-background shadow-[8px_8px_0px_0px_#1A1A1A] p-6 sm:p-8">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-primary uppercase tracking-tighter mb-1">
            Dumb Simple Todos
          </h1>
          <p className="font-mono text-xs text-on-surface-variant mb-6">
            {authMode === 'login' ? 'LOG IN TO CONTINUE' : 'CREATE AN ACCOUNT'}
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs text-on-surface-variant">USERNAME</label>
              <input
                className="w-full bg-surface border-[3px] border-on-background p-3 focus:outline-none focus:shadow-[4px_4px_0px_0px_#006b5b] transition-shadow"
                value={authUsername}
                onChange={e => setAuthUsername(e.target.value)}
                placeholder="yourname"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs text-on-surface-variant">PASSWORD</label>
              <input
                type="password"
                className="w-full bg-surface border-[3px] border-on-background p-3 focus:outline-none focus:shadow-[4px_4px_0px_0px_#006b5b] transition-shadow"
                value={authPassword}
                onChange={e => setAuthPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAuthSubmit()}
                placeholder="••••••••"
              />
            </div>

            {authError && (
              <p className="font-mono text-xs text-error">{authError}</p>
            )}

            <button
              onClick={handleAuthSubmit}
              className="w-full bg-on-background text-surface border-[3px] border-on-background p-3 font-bold uppercase tracking-widest hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[6px_6px_0px_0px_#007261]"
            >
              {authMode === 'login' ? 'Log In' : 'Sign Up'}
            </button>

            <button
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'signup' : 'login')
                setAuthError('')
              }}
              className="font-mono text-xs text-on-surface-variant underline underline-offset-4 hover:text-primary"
            >
              {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // --- MAIN TODO APP (only shown when logged in) ---
  return (
    <div className="min-h-screen bg-[#fcf9f8] text-on-surface font-sans"
      style={{ backgroundImage: 'radial-gradient(#ddbecd 1px, transparent 1px)', backgroundSize: '24px 24px' }}>

      <header className="sticky top-0 z-50 bg-background border-b-[3px] border-on-background shadow-[4px_4px_0px_0px_#1A1A1A]">
        <nav className="flex justify-between items-center w-full px-4 sm:px-8 py-3 max-w-[1000px] mx-auto">
          <span className="font-display text-xl sm:text-3xl font-extrabold text-primary uppercase tracking-tighter">
            Dumb Simple Todos
          </span>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-on-surface-variant hidden sm:inline">
              Hi, {username}
            </span>
            <button
              onClick={handleLogout}
              className="font-mono text-xs border-[2px] border-on-background px-3 py-1.5 bg-surface hover:bg-error hover:text-surface transition-colors"
            >
              Log out
            </button>
          </div>
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

                    {editingId === todo._id ? (
                      <input
                        autoFocus
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveEdit(todo._id)
                          if (e.key === 'Escape') cancelEdit()
                        }}
                        className="flex-grow font-display text-base sm:text-xl font-bold text-on-surface bg-surface border-[3px] border-on-background p-2 focus:outline-none"
                      />
                    ) : (
                      <span className={`flex-grow font-display text-base sm:text-xl font-bold text-on-surface break-words ${todo.done ? 'line-through' : ''}`}>
                        {todo.text}
                      </span>
                    )}

                    {editingId === todo._id ? (
                      <>
                        <button
                          onClick={() => saveEdit(todo._id)}
                          className="p-1 sm:p-2 shrink-0 text-secondary hover:scale-110 transition-transform"
                        >
                          <span className="material-symbols-outlined text-lg sm:text-xl">check</span>
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1 sm:p-2 shrink-0 text-on-surface-variant hover:scale-110 transition-transform"
                        >
                          <span className="material-symbols-outlined text-lg sm:text-xl">close</span>
                        </button>
                      </>
                    ) : (
                      <>
                        {!todo.done && (
                          <button
                            onClick={() => startEditing(todo)}
                            className="p-1 sm:p-2 shrink-0 text-on-surface-variant hover:text-primary transition-transform hover:scale-110"
                          >
                            <span className="material-symbols-outlined text-lg sm:text-xl">edit</span>
                          </button>
                        )}
                        <button
                          onClick={() => deleteTodo(todo._id)}
                          className="p-1 sm:p-2 shrink-0 text-on-surface-variant hover:text-error transition-transform hover:scale-110"
                        >
                          <span className="material-symbols-outlined text-lg sm:text-xl">delete</span>
                        </button>
                      </>
                    )}
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

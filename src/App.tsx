import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import DPSMeter from './components/DPSMeter'
import About from './components/About'
import '/static/styles/App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="main-nav">
          <div className="nav-content">
            <Link to="/" className="nav-logo">
              <span className="logo-icon">⚔️</span>
              <span className="logo-text">TL DPS Meter</span>
            </Link>
            <div className="nav-links">
              <Link to="/" className="nav-link">DPS Meter</Link>
              <Link to="/about" className="nav-link">About</Link>
              <a 
                href="https://buymeacoffee.com/droprate" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="nav-coffee-link"
              >
                <button className="btn-coffee">
                  ☕ Buy Me a Coffee
                </button>
              </a>
            </div>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<DPSMeter />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

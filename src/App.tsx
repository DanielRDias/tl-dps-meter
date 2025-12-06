import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom'
import DPSMeter from './components/DPSMeter'
import SharedView from './components/SharedView'
import './App.css'

function SharePage() {
  const { shareId } = useParams<{ shareId: string }>()
  
  if (!shareId) {
    return <div className="app">Invalid share link</div>
  }
  
  return (
    <div className="app">
      <SharedView shareId={shareId} />
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div className="app"><DPSMeter /></div>} />
        <Route path="/share/:shareId" element={<SharePage />} />
      </Routes>
    </Router>
  )
}

export default App

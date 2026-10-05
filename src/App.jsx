import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/Layout'
import Home from './pages/Home'
import CodeEditor from './pages/CodeEditor'
import ReviewResults from './pages/ReviewResults'
import History from './pages/History'

function App() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="editor" element={<CodeEditor />} />
          <Route path="results" element={<ReviewResults />} />
          <Route path="history" element={<History />} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

export default App

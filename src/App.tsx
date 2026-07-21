import { HashRouter, Routes, Route } from 'react-router-dom'
import ScoreListPage from './pages/ScoreListPage'
import ViewerPage from './pages/ViewerPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<ScoreListPage />} />
        <Route path="/viewer/:scoreId" element={<ViewerPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </HashRouter>
  )
}

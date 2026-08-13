import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { Layout } from './components/Layout'
import { AddGamePage } from './pages/AddGamePage'
import { CollectionPage } from './pages/CollectionPage'
import { EditGamePage } from './pages/EditGamePage'
import { GameDetailPage } from './pages/GameDetailPage'
import { LoginPage } from './pages/LoginPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<CollectionPage />} />
            <Route path="games/new" element={<AddGamePage />} />
            <Route path="games/:id" element={<GameDetailPage />} />
            <Route path="games/:id/edit" element={<EditGamePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

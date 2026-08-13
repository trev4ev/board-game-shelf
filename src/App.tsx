import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { routerBasename } from './lib/appUrl'
import { AuthProvider } from './auth/AuthProvider'
import { Layout } from './components/Layout'
import { AddGameLayout } from './pages/AddGameLayout'
import { AddGameReviewPage } from './pages/AddGameReviewPage'
import { AddGameSearchPage } from './pages/AddGameSearchPage'
import { CollectionPage } from './pages/CollectionPage'
import { EditGamePage } from './pages/EditGamePage'
import { GameDetailPage } from './pages/GameDetailPage'
import { LoginPage } from './pages/LoginPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={routerBasename()}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<CollectionPage />} />
            <Route path="games/new" element={<AddGameLayout />}>
              <Route index element={<AddGameSearchPage />} />
              <Route path="review" element={<AddGameReviewPage />} />
            </Route>
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

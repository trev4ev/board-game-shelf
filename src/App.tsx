import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { routerBasename } from './lib/appUrl'
import { AuthProvider } from './auth/AuthProvider'
import { RequireUsername } from './auth/RequireUsername'
import { Layout } from './components/Layout'
import { AddGameLayout } from './pages/AddGameLayout'
import { AddGameReviewPage } from './pages/AddGameReviewPage'
import { AddGameSearchPage } from './pages/AddGameSearchPage'
import { BulkAddGamesPage } from './pages/BulkAddGamesPage'
import { CollectionPage } from './pages/CollectionPage'
import { CollectionSettingsPage } from './pages/CollectionSettingsPage'
import { EditGamePage } from './pages/EditGamePage'
import { FriendsPage } from './pages/FriendsPage'
import { GameDetailPage } from './pages/GameDetailPage'
import { GamesNewRedirect } from './pages/GamesNewRedirect'
import { HomePage } from './pages/HomePage'
import { InvitePage } from './pages/InvitePage'
import { LoginPage } from './pages/LoginPage'
import { LogPlayPage } from './pages/LogPlayPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { OnboardingPage } from './pages/OnboardingPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={routerBasename()}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="onboarding" element={<OnboardingPage />} />
            <Route path="invite/:token" element={<InvitePage />} />
            <Route path="c/:collectionId" element={<CollectionPage />} />
            <Route path="games/:id" element={<GameDetailPage />} />
            <Route element={<RequireUsername />}>
              <Route index element={<HomePage />} />
              <Route path="friends" element={<FriendsPage />} />
              <Route path="c/:collectionId/settings" element={<CollectionSettingsPage />} />
              <Route path="c/:collectionId/games/new" element={<AddGameLayout />}>
                <Route index element={<AddGameSearchPage />} />
                <Route path="review" element={<AddGameReviewPage />} />
                <Route path="bulk" element={<BulkAddGamesPage />} />
              </Route>
              <Route path="games/new" element={<GamesNewRedirect />} />
              <Route path="games/:id/play" element={<LogPlayPage />} />
              <Route path="games/:id/edit" element={<EditGamePage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

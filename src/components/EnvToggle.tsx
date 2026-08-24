import { useEffect } from 'react'
import { FlaskConical, Globe } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'
import {
  isStagingDeploy,
  rememberOwnerTester,
  showOwnerEnvToggle,
  siblingDeployUrl,
} from '../lib/deployEnv'
import './EnvToggle.css'

export function EnvToggle() {
  const { user } = useAuth()

  useEffect(() => {
    rememberOwnerTester(user?.email)
  }, [user?.email])

  if (!showOwnerEnvToggle(user?.email)) return null

  const staging = isStagingDeploy()
  const href = siblingDeployUrl(staging ? 'production' : 'staging')
  const label = staging ? 'Open this page on production' : 'Open this page on staging'
  const Icon = staging ? FlaskConical : Globe

  return (
    <a
      className={staging ? 'env-toggle is-staging' : 'env-toggle is-production'}
      href={href}
      aria-label={label}
      title={label}
    >
      <Icon size={20} strokeWidth={2.25} aria-hidden />
    </a>
  )
}

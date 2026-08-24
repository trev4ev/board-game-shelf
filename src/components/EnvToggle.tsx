import { useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider'
import {
  isStagingDeploy,
  rememberOwnerTester,
  showOwnerEnvToggle,
  siblingDeployUrl,
} from '../lib/deployEnv'
import './EnvToggle.css'

function EnvOption({
  current,
  href,
  children,
}: {
  current: boolean
  href: string
  children: string
}) {
  if (current) {
    return (
      <span className="env-toggle-opt is-current" aria-current="true">
        {children}
      </span>
    )
  }
  return (
    <a className="env-toggle-opt" href={href}>
      {children}
    </a>
  )
}

export function EnvToggle() {
  const { user } = useAuth()

  useEffect(() => {
    rememberOwnerTester(user?.email)
  }, [user?.email])

  if (!showOwnerEnvToggle(user?.email)) return null

  const staging = isStagingDeploy()
  const local = import.meta.env.DEV

  return (
    <div className="env-toggle" role="group" aria-label="Switch site environment">
      {local ? <span className="env-toggle-label">Local</span> : null}
      <EnvOption current={!staging && !local} href={siblingDeployUrl('production')}>
        Prod
      </EnvOption>
      <EnvOption current={staging} href={siblingDeployUrl('staging')}>
        Staging
      </EnvOption>
    </div>
  )
}

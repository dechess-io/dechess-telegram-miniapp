import { ReactNode } from 'react'
import { App as KonstaApp } from 'konsta/react'
import { Page } from 'konsta/react'

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <KonstaApp className="dark" theme={undefined}>
      <Page className="overflow-auto hide-scrollbar">{children}</Page>
    </KonstaApp>
  )
}

export default AuthLayout

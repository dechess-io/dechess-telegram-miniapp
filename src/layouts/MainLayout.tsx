import { ReactNode } from 'react'
import { App as KonstaApp } from 'konsta/react'
import { Page } from 'konsta/react'
import Header from './Header'
import Footer from './Footer/Footer'

const MainLayout = ({ children, isFooter = true }: { children: ReactNode; isFooter?: boolean }) => {
  // const theme = isAndroid ? 'material' : 'ios'

  return (
    <KonstaApp theme={'ios'}>
      <Page className="overflow-auto hide-scrollbar">
        {/* <Header /> */}
        {children}
        {isFooter && <Footer />}
      </Page>
    </KonstaApp>
  )
}

export default MainLayout

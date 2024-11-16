import { ReactNode } from 'react'
import { Page } from 'konsta/react'

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <Page className="overflow-auto hide-scrollbar">
      {/* <Header /> */}
      {children}
      {/* {isFooter && <Footer />} */}
    </Page>
  )
}

export default MainLayout

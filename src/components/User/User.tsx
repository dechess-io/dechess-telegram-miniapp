import { isAndroid } from 'react-device-detect'
import { App, Block, Button, Page } from 'konsta/react'

import UserProfile from './UserProfile'
import History from './History'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer/Footer'

const User: React.FC<{}> = ({}) => {
  const theme = isAndroid ? 'material' : 'ios'

  return (
    <App theme={theme}>
      <Page className="overflow-auto hide-scrollbar">
        <Header />
        <Block strong style={{ paddingRight: '0', paddingLeft: '0' }}>
          <div className="flex flex-col pt-4 bg-[#041d21]">
            <div className="border-none rounded-xl bg-[#041d21] min-h-screen">
              <UserProfile name="levien" title="levien" />
              <History />
            </div>
          </div>
        </Block>

        <Footer />
      </Page>
    </App>
  )
}

export default User

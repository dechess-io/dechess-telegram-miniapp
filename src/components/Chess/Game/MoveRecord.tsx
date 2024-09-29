import { useEffect, useRef, useState } from 'react'
import { useAppSelector } from '../../../redux/store'
import { selectGame } from '../../../redux/game/reducer'
import cn from '../../../services/cn'
import { Block, Navbar, Page, Panel, Link, List, ListItem, App } from 'konsta/react'
import { THEME } from '@tonconnect/ui-react'

type MoveRecordProps = {}

const MoveRecord: React.FC<MoveRecordProps> = () => {
  const { moves, moveIndex, history } = useAppSelector(selectGame)
  const [rightFloatingPanelOpened, setRightFloatingPanelOpened] = useState(false)

  const moveListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (moveListRef.current) {
      moveListRef.current.scrollLeft = moveListRef.current.scrollWidth
    }
  }, [moves])

  return (
    <>
      <div
        className="relative rounded overflow-hidden min-h-[16px] z-50"
        onClick={() => setRightFloatingPanelOpened((prev) => !prev)}
      >
        <div
          ref={moveListRef}
          className={cn(
            'flex items-center text-xs gap-4 text-white overflow-x-auto whitespace-nowrap bg-opacity-80 pl-2 pr-4 scrollbar-hide absolute inset-0',
            {
              'bg-blue-gradient-1': moves.length > 0,
              'bg-transparent': moves.length === 0,
            }
          )}
        >
          {moves.map((move, index) => {
            if (index >= moveIndex) return
            return <p key={index}>{`${index % 2 === 0 ? index / 2 + 1 + '. ' : ''}${move}`}</p>
          })}
        </div>
      </div>
      <Panel side="right" floating opened={rightFloatingPanelOpened} className="">
        <Page className="scrollbar-hidden">
          {/* <Navbar
            title="Transaction Record"
            right={
              <Link navbar onClick={() => setRightFloatingPanelOpened(false)}>
                Close
              </Link>
            }
          />{' '} */}
          <Block className="space-y-4">
            <List strong>
              {history.map((data, index) => {
                if (index == 0) return
                if (index > moveIndex) return
                return (
                  <ListItem
                    href={`https://explorer.solana.com/tx/${(data as any).transaction}?cluster=devnet`}
                    title={`${moves[index - 1]} ${(data as any).transaction}`}
                    target="_blank"
                  ></ListItem>
                )
              })}
            </List>
          </Block>
        </Page>
      </Panel>
    </>
  )
}

export default MoveRecord

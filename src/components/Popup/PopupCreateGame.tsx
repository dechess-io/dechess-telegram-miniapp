import { useState } from 'react'
import Button from '../Button/Button'
import Popup from './Popup'
import { socket } from '../../services/socket'

import { useNavigate } from 'react-router-dom'
import { usePopups } from './PopupProvider'
import restApi from '../../services/api'
import { apiHeader } from '../../utils/utils'

const PopupCreateGame: React.FC<{}> = () => {
  const [isBettingMatch, setIsBettingMatch] = useState(true)
  const [isLoadingCreateGame, setIsLoadingCreateGame] = useState(false)
  const navigate = useNavigate()

  const { removeAll } = usePopups()

  const onHandleCreateMatch = async () => {
    try {
      if (isBettingMatch) {
        socket.emit('createGame', (response: any) => {
          if (response.status === 200) {
            navigate(`/game/${response.board.game_id}`)
            setIsLoadingCreateGame(false)
            removeAll()
          } else if (response.status === 202) {
            console.log('Waiting for an opponent...')
          } else {
            console.error('Failed to create game')
            setIsLoadingCreateGame(false)
          }
        })

        socket.on('createGame', async function (data) {
          if (data.status === 200) {
            navigate(`/game/${data.board.game_id}`)
            setIsLoadingCreateGame(false)
            removeAll()
          }
        })
      } else {
        const res = await restApi
          .post(
            '/new-game-v2',
            {
              params: { isPaymentMatch: false },
            },
            { headers: apiHeader }
          )
          .then((data) => {
            return data
          })
        if (res.data.status === 200) {
          navigate(`/game/${res.data.board.game_id}`)
          setIsLoadingCreateGame(false)
          removeAll()
        }
      }
    } catch (error) {
      setIsLoadingCreateGame(false)
    }
  }

  return (
    <Popup className="bg-gray-100 min-w-[500px] max-w-[600px]">
      <div className="flex flex-col space-y-4">
        <h1 className="mb-4 text-center font-bold text-[20px]">Start Chess Match</h1>
        <div className="flex justify-between space-x-2 text-center">
          <div className="border border-2 border-green-400 bg-green-100 rounded-2xl w-1/2 p-2 cursor-pointer">
            <div className="text-[20px] font-semibold flex space-x-2 justify-center items-center">
              <input
                id="link-checkbox"
                type="checkbox"
                // checked={}
                disabled
                // onClick={() => setIsBettingMatch(false)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <div>Betting Match</div>
            </div>
            <div className="text-[14px]">
              Play and earn from winning
              <p className="font-bold">(Soon)</p>
            </div>
          </div>

          <div
            className="border border-2 border-blue-400 bg-blue-100 rounded-2xl w-1/2 p-2 cursor-pointer"
            onChange={() => setIsBettingMatch(true)}
          >
            <div className="text-[20px] font-semibold flex space-x-2 justify-center items-center">
              <input
                id="link-checkbox"
                type="checkbox"
                checked={isBettingMatch}
                onClick={() => setIsBettingMatch(true)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <div>Free Match</div>
            </div>
            <div className="text-[14px]">Available for Web2 and Web3 can be played together</div>
          </div>
        </div>
        <div className="mx-auto">
          <Button
            className="cursor-pointer bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 !rounded-xl font-bold text-white min-w-[200px] leading-[21px]"
            size="small"
            loading={isLoadingCreateGame}
            onClick={onHandleCreateMatch}
          >
            Create Game
          </Button>
        </div>
      </div>
    </Popup>
  )
}
export default PopupCreateGame

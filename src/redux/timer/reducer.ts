import { createReducer } from '@reduxjs/toolkit'
import { defaultTimerReducer, TimerReducer } from './type'
import { RootState } from '../store'
import { resetTimer, setPlayer1Timer, setPlayer2Timer, setTimer1, setTimer2 } from './action'

const timerReducer = createReducer(defaultTimerReducer, (builder: any) => {
  builder.addCase(setTimer1, (state: TimerReducer, action: any) => {
    state.timer1 = action.payload
  })
  builder.addCase(setTimer2, (state: TimerReducer, action: any) => {
    state.timer2 = action.payload
  })

  builder.addCase(setPlayer1Timer, (state: TimerReducer, action: any) => {
    state.player1Timer = action.payload
  })
  builder.addCase(setPlayer2Timer, (state: TimerReducer, action: any) => {
    state.player2Timer = action.payload
  })
  builder.addCase(resetTimer, (state: TimerReducer) => {
    Object.assign(state, defaultTimerReducer)
  })
})

export const selectTimer = (state: RootState) => state.timer

export default timerReducer

import { createReducer } from '@reduxjs/toolkit'
import { defaultTimerReducer, TimerReducer } from './type'
import { RootState } from '../store'
import { setPlayer1Timer, setPlayer2Timer, setTimer1, setTimer2 } from './action'

const timerReducer = createReducer(defaultTimerReducer, (builder: any) => {
  builder.addCase(setTimer1, (state: TimerReducer, action: any) => {
    console.log(action)
    state.timerA = action.payload.time
  })
  builder.addCase(setTimer2, (state: TimerReducer, action: any) => {
    console.log(action)
    state.timerB = action.payload.time
  })

  builder.addCase(setPlayer1Timer, (state: TimerReducer, action: any) => {
    console.log(action)
    state.timerA = action.payload.time
  })
  builder.addCase(setPlayer2Timer, (state: TimerReducer, action: any) => {
    console.log(action)
    state.timerB = action.payload.time
  })
})

export const selectTimer = (state: RootState) => state.timer

export default timerReducer

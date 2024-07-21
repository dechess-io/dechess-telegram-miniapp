import { createAction } from '@reduxjs/toolkit'

export const setTimer1 = createAction<number>('/timer/set-timer-1')

export const setTimer2 = createAction<number>('/timer/set-timer-2')

export const setPlayer1Timer = createAction<number>('/timer/set-player-1-timer')

export const setPlayer2Timer = createAction<number>('/timer/set-player-2-timer')

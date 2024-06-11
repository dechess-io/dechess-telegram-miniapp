import { createAsyncThunk, createReducer } from '@reduxjs/toolkit'
import { RootState } from '../store'

export const getTournaments = createAsyncThunk(
  'tournament/get',
  async ({}: {}, { getState, dispatch }) => {
    try {
      getState
      return ''
    } catch (error) {
      console.log('7s200:err', error)
      return null
    }
  }
)
export const createTournament = createAsyncThunk(
  'tournament/create',
  async (
    {
      activeSigner,
      activeAccount,
      reward,
      totalPlayer,
    }: { activeSigner: any; activeAccount: any; reward: number; totalPlayer: number },
    {}
  ) => {
    try {
      activeAccount
      return ''
    } catch (error) {
      console.log('7s200:createTournament:err', error)
      return
    }
  }
)
export const updateTournamentStatus = createAsyncThunk(
  'tournament/update',
  async (
    {
      activeSigner,
      activeAccount,
      tournamentIndex,
      isStart,
      isEnd,
    }: {
      activeSigner: any
      activeAccount: any
      tournamentIndex: number
      isStart: boolean
      isEnd: boolean
    },
    {}
  ) => {
    try {
      activeAccount
      return ''
    } catch (error) {
      console.log('7s200:updateTournamentStatus:err', error)
      return
    }
  }
)
export const registerTournament = createAsyncThunk(
  'tournament/register',
  async (
    {
      activeSigner,
      activeAccount,
      tournamentIndex,
      cb,
    }: {
      activeSigner: any
      activeAccount: any
      tournamentIndex: number
      cb: (status: boolean) => void
    },
    {}
  ) => {
    try {
      return ''
    } catch (error) {
      console.log('7s200:registerTournament:err', error)
      cb(false)

      return
    }
  }
)
export const claimReward = createAsyncThunk(
  'tournament/claim',
  async (
    {
      activeSigner,
      activeAccount,
      tournamentIndex,
    }: { activeSigner: any; activeAccount: any; tournamentIndex: number },
    {}
  ) => {
    try {
      activeAccount

      return ''
    } catch (error) {
      console.log('7s200:claimReward:err', error)
      return
    }
  }
)

export type TournamentReducer = {
  loading: boolean
  tournament: any
}

export const defaultTournamentReducer: TournamentReducer = {
  loading: false,
  tournament: null,
}

const tournamentReducer = createReducer(defaultTournamentReducer, (builder) => {
  builder
    .addCase(getTournaments.pending, (state) => {
      state.loading = true
    })
    .addCase(getTournaments.fulfilled, (state, action) => {
      state.tournament = action.payload
      state.loading = false
    })
})

export const selectTournament = (state: RootState) => state.tournament

export default tournamentReducer

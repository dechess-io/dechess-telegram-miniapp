import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import accountReducer from './account/account.reducer'
import tournamentReducer from './tournament/tournament.reducer'
import gameReducer from './game/reducer'
// import toastReducer from "./reducers/toastReducer";

const createStore = () => {
  return configureStore({
    reducer: {
      account: accountReducer,
      game: gameReducer,
      tournament: tournamentReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  })
}

export let store = createStore()

export const refreshStore = () => {
  store = createStore()
}

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type StoreType = typeof store

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>

import { createAsyncThunk, createReducer } from '@reduxjs/toolkit';
import { RootState } from '../store';

export const getGame = createAsyncThunk(
  'game/get',
  async (
    {
      index,
      activeAccount,
      activeSigner,
    }: { index: string | number; activeAccount: any; activeSigner: any },
    { getState, dispatch }
  ) => {
    try {
      index;
      getState;
      dispatch;
      activeAccount;
      activeSigner;
      return '';
    } catch (error) {
      return null;
      console.log('7s200:err', error);
    }
  }
);

export type GameReducer = {
  loading: boolean;
  game: any;
};

export const defaultGameReducer: GameReducer = {
  loading: false,
  game: null,
};

const gameReducer = createReducer(defaultGameReducer, (builder) => {
  builder
    .addCase(getGame.pending, (state) => {
      state.loading = true;
    })
    .addCase(getGame.fulfilled, (state, action) => {
      state.game = (action.payload as any).ok;
      state.loading = false;
    });
});

export const selectGame = (state: RootState) => state.game;

export default gameReducer;

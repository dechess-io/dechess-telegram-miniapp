import { createAsyncThunk, createReducer } from '@reduxjs/toolkit';

import { RootState } from '../store';
import restApi from '../../services/api';

export const getAccount = createAsyncThunk('account/get', () => {});

export const getLoginMessage = createAsyncThunk('account/get-message', async () => {
  try {
    await restApi
      .get('/login-message')
      .then((response: any) => {
        console.log('7s200:res', response.data.message);
        return null;
      })
      .catch((err) => {
        return;
      });
  } catch (error) {
    return null;
  }
});

export type AccountReducer = {
  loading: boolean;
};

export const defaultAccountReducer: AccountReducer = {
  loading: false,
};

const accountReducer = createReducer(defaultAccountReducer, (builder) => {
  builder
    .addCase(getLoginMessage.fulfilled, (state, action) => {})
    .addCase(getAccount.fulfilled, (state, action) => {});
});

export const selectAcount = (state: RootState) => state.account;

export default accountReducer;

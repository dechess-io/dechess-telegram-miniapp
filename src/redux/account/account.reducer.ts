import { createAsyncThunk, createReducer } from '@reduxjs/toolkit'

import { RootState } from '../store'
import restApi from '../../services/api'
import { generateAuthorization } from '../../services/token'

export const getAccount = createAsyncThunk('account/get', () => {})

export const getLoginMessage = createAsyncThunk('account/get-message', async () => {
  try {
    await restApi
      .get('/login-message')
      .then((response: any) => {
        return null
      })
      .catch((err) => {
        return
      })
  } catch (error) {
    return null
  }
})

export const getUserInfo = createAsyncThunk(
  'account/user-info',
  async ({ cb }: { cb: (user: any) => void }) => {
    try {
      const token = localStorage.getItem('token') as string
      const result = await restApi
        .get('/get-user', {
          headers: { Authorization: generateAuthorization(token) },
        })
        .then((response: any) => {
          return response.data.data.userInfo
        })
        .catch((err) => {
          return null
        })
      if (cb) {
        cb(result)
      }
      return result
    } catch (error) {
      return null
    }
  }
)

export const updateAddress = createAsyncThunk(
  'account/updateAddress',
  async (newAddress: string | undefined) => {
    if (!newAddress) {
      return 'Missing address'
    }
    return newAddress // Simulate returning the new address, could be an API call
  }
)

export const submitEarlyAccessCode = createAsyncThunk(
  'account/submit-early-access-code',
  async ({ code, cb }: { code: string; cb: (user: any) => void }) => {
    try {
      const token = localStorage.getItem('token') as string
      const result = await restApi
        .post(
          '/early-access',
          { code: code },
          {
            headers: { Authorization: generateAuthorization(token) },
          }
        )
        .then((response: any) => {
          return response.data
        })
        .catch((err) => {
          return null
        })
      if (cb) {
        cb(result)
      }
      return result
    } catch (error) {
      return null
    }
  }
)

export type AccountReducer = {
  loading: boolean
  user: any
  address: string
}

export const defaultAccountReducer: AccountReducer = {
  loading: false,
  user: null,
  address: '',
}

const accountReducer = createReducer(defaultAccountReducer, (builder) => {
  builder
    .addCase(getLoginMessage.fulfilled, (state, action) => {})
    .addCase(getAccount.fulfilled, (state, action) => {})
    .addCase(getUserInfo.pending, (state, action) => {
      return { ...state, loading: true }
    })
    .addCase(getUserInfo.fulfilled, (state, action) => {
      console.log('action', action.payload)
      return { ...state, user: action.payload, loading: false }
    })
    .addCase(updateAddress.fulfilled, (state, action) => {
      return { ...state, address: action.payload }
    })
})

export const selectAcount = (state: RootState) => state.account

export default accountReducer

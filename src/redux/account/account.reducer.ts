import { createAsyncThunk, createReducer } from '@reduxjs/toolkit'

import { RootState } from '../store'
import restApi from '../../services/api'
import { generateAuthorization } from '../../services/token'
import bs58 from 'bs58'

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
          console.log('7s200:res', response)
          return response.data.data.userInfo
        })
        .catch((err) => {
          if (err.response.status === 403) {
            localStorage.removeItem('token')
          }
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

export const generatePayloadSolana = createAsyncThunk(
  'account/solana/generate-payload',
  async ({
    address,
    network,
    cb,
  }: {
    address: string
    network: string
    cb: (message: any) => void
  }) => {
    try {
      if (address.length === 0) return cb(null)
      if (network.length === 0) return cb(null)
      const result = await restApi
        .post('/generate-payload-solana', {
          address: address,
          network: network,
        })
        .then((data) => data)
        .catch((err) => {
          console.log('err', err)
        })
      if (!result) return cb(null)
      if (result.data.status === 200) {
        return cb(result.data.data)
      }
    } catch (error) {
      cb(null)
      return null
    }
  }
)

export const verifySignatureSolana = createAsyncThunk(
  'account/solana/verify-signature',
  async ({
    address,
    signature,
    message,
    network,
    cb,
  }: {
    address: string
    signature: any
    message: any
    network: string
    cb: (message: any) => void
  }) => {
    try {
      if (address.length === 0) return cb(null)
      if (network.length === 0) return cb(null)
      const result = await restApi
        .post('/veirfy-signature-solana', {
          address: address,
          signature: bs58.encode(signature),
          message: message,
          network: network,
        })
        .then((data) => data)
        .catch((err) => {
          console.log('err', err)
        })
      console.log('7s200:result', result)
      if (!result) return cb(null)
      if (result.data.status === 200) {
        localStorage.setItem('token', result.data.data)
        localStorage.setItem('blockchain', result.data.blockchain)
        localStorage.setItem('address', address.toString())
        return cb(result.data.data)
      }
    } catch (error) {
      cb(null)
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

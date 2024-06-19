import {
  Account,
  ConnectAdditionalRequest,
  SendTransactionRequest,
  TonProofItemReplySuccess,
} from '@tonconnect/ui-react'
import { setAuthToken } from '../utils/utils'

// import './patch-local-storage-for-github-pages'

class TonProofDemoApiService {
  private localStorageKey = 'token'

  private host = 'https://api.dechess.io'
  public accessToken: string | null = null

  public readonly refreshIntervalMs = 9 * 60 * 1000

  constructor() {
    this.accessToken = localStorage.getItem(this.localStorageKey)

    if (!this.accessToken) {
      this.generatePayload()
    }
  }

  async generatePayload(): Promise<ConnectAdditionalRequest | null> {
    try {
      const response = await (
        await fetch(`${this.host}/generate_payload`, {
          method: 'POST',
        })
      ).json()
      return { tonProof: response.data as string }
    } catch (error) {
      return null
    }
  }

  async checkProof(proof: TonProofItemReplySuccess['proof'], account: Account): Promise<void> {
    console.log('7s200:checkproof')
    try {
      const reqBody = {
        address: account.address,
        network: account.chain,
        public_key: account.publicKey,
        proof: {
          ...proof,
          state_init: account.walletStateInit,
        },
      }

      const response = await (
        await fetch(`${this.host}/check_proof`, {
          method: 'POST',
          body: JSON.stringify(reqBody),
        })
      ).json()
      console.log('7s200:checkproof', response)
      if (response?.data) {
        // console.log(1)
        localStorage.setItem(this.localStorageKey, response.data)
        setAuthToken(response.data)
        // console.log(2, localStorage.getItem(this.localStorageKey))
        this.accessToken = response.data
        // console.log(3, this.accessToken)
      }
    } catch (e) {
      console.log('checkProof error:', e)
    }
  }

  async getAccountInfo(account: Account) {
    const response = await (
      await fetch(`${this.host}/get_account_info`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      })
    ).json()

    return response as {}
  }

  // reset() {
  //   this.accessToken = null
  //   localStorage.removeItem(this.localStorageKey)
  //   this.generatePayload()
  // }
}

export const TonProofDemoApi = new TonProofDemoApiService()

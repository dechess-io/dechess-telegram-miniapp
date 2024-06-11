// Captures 0x + 4 characters, then the last 4 characters.
const truncateRegex = /^((?:.){12}).+((?:.){12})$/ // 4-4
const longTruncateRegex = /^(0x[a-zA-Z0-9]{16})[a-zA-Z0-9]+([a-zA-Z0-9]{6})$/ // 4-6
const txTruncateRegex = /^(0x[a-zA-Z0-9]{6})[a-zA-Z0-9]+([a-zA-Z0-9]{6})$/ // 6-6
const truncateSuiRegex = /^((?:.){4}).+((?:.){4})$/ // 4-4

/**
 * Truncates an ethereum address to the format 0x0000…0000
 * @param address Full address to truncate
 * @returns Truncated address
 */

export const truncateEthAddress = (address: string) => {
  const match = address.match(truncateRegex)

  if (!match) return address
  return `${match[1]}...${match[2]}`
}

export const longTruncateEthAddress = (address: string) => {
  const match = address.match(longTruncateRegex)

  if (!match) return address
  return `${match[1]}...${match[2]}`
}

export const txTruncateEthAddress = (address: string) => {
  const match = address.match(txTruncateRegex)

  if (!match) return address
  return `${match[1]}...${match[2]}`
}

export const truncateSuiTx = (txn: string, isShowRawText?: boolean) => {
  const match = txn.match(truncateSuiRegex)

  if (!match) return isShowRawText ? txn : match
  return `${match[1]}...${match[2]}`
}

export const addressValidator = (address: string) => {
  return /^(0x[a-f0-9]{64})$/g.test(address)
}

export const chunkArray = (array: Array<any>, size: number) => {
  const result = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

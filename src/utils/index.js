import { BigNumber } from 'bignumber.js'

export function addressSplice(address) {
    return (address.substr(0, 6) + '...' + address.substr(address.length - 4, 4))
}

export function prettyNumber(number, decimals = 0) {
    let bigNumber = BigNumber.isBigNumber(number) ? number : new BigNumber(number)
    return bigNumber.toFormat(
        bigNumber
            .toFormat()
            .split('')
            .findIndex(function (e) {
                return '0' !== e && '.' !== e
            }) + decimals
    )
}
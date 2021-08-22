import Web3 from 'web3'
import { URL_RPC, WSS_RPC, CONTRACT_ADDRESS } from '@/Constants'
import abi from '@/Constants/abi.json'

class RPC {
    web3
    web3Ws
    contract
    contractWS
    booted = false

    constructor() {
        this.boot()
    }

    boot() {
        /**
         * Ignore multiple calls to the boot method
         */
        if (this.booted) {
          return
        }
        this.booted = true
        this.web3 = new Web3(new Web3.providers.HttpProvider(URL_RPC))
        this.web3Ws = new Web3(new Web3.providers.WebsocketProvider(WSS_RPC))
        this.contract = new this.web3.eth.Contract(abi, CONTRACT_ADDRESS)
        this.contractWS = new this.web3Ws.eth.Contract(abi, CONTRACT_ADDRESS)
    }

    async gameHistory(gameId) {
        return await this.contract.methods.gameHistory(gameId).call()
    }

    async pricePerPoint() {
        return await this.contract.methods.pricePerPoint().call();
    }

    async getTotalPoints() {
        return await this.contract.methods.totalPoint().call()
    }

    async last20Game() {
        // const callListGame = await this.contract.methods.last20Game().call()
        // var listGame = []
        // callListGame.forEach(game => {
        //     if(game.address)
        // })
        return await this.contract.methods.last20Game().call()
    }

    async getPlayer(address) {
        return await this.contract.methods.getPlayer(address).call()
    }

}

export default new RPC()
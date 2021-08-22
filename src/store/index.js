import Web3 from 'web3'
import Scheduler from '@/Services/Scheduler'
import Vue from 'vue'
import Vuex from 'vuex'
import {
    CHAIN_ID,
    CHAIN_NAME,
    RPC_URL,
    EXPLORER_URL,
    CURRENCY_SYMBOL,
    CONTRACT_ADDRESS
} from '@/Constants'
import RPC from '../Services/RPC'
import abi from '@/Constants/abi.json'

Vue.use(Vuex)

const state = {
    web3: null,
    metamaskStatus: null,
    userAddress: null,
    balanceETH: 0,
    balanceToken: 0,
    booted: false,
    autoConnect: localStorage.getItem("AUTO_CONNECT_WALLET") || null,
    //
    betAmount: 1,
    totalWon: 0,
    totalPlayed: 0,
    lastGameId: null,
    //
    loading: false,
}

const getters = {
    notLogon: (state) => {
        return (
            state.metamaskStatus === 'NO_LOGIN' ||
            state.metamaskStatus === 'USER_DENIED'
        )
    },
    noMetamask: (state) => {
        return state.metamaskStatus === 'NO_INSTALL_METAMASK'
    },
    wrongNetwork: (state) => {
        return state.metamaskStatus === 'WRONG_NETWORK'
    },
    connected: (state) => {
        return state.metamaskStatus === CHAIN_NAME
    },
    checkAutoConnect: (state) => {
        if(state.autoConnect) return true
        else return false
    }
}

const mutations = {
    web3Update(state, payload) {
        state.web3 = payload;
    },
    walletUpdate(state, payload) {
        state.userAddress = payload;
    },
    balanceETHUpdate(state, payload) {
        state.balanceETH = payload
    },
    metamaskStatus(state, payload) {
        state.metamaskStatus = payload
    },
    balanceToken(state, payload) {
        state.balanceToken = payload
    },
    updateBetAmount(state, newAmount) {
        state.betAmount = newAmount
    },
    loading(state, status) {
        state.loading = status
    },
    updatePlayer(state, payload) {
        state.totalWon = payload.totalWon
        state.totalPlayed = payload.totalPlayed
        state.lastGameId = payload.lastGameId
    },
}

const actions = {
    async walletBoot({ dispatch, commit, state, getters }) {
        if (state.booted) return
        if (window.ethereum) {
            if(getters.checkAutoConnect) {
                commit("web3Update", new Web3(window.ethereum))
                await state.web3.eth.getAccounts((err, accounts) => {
                    if (err == null && accounts.length > 0) {
                        // User already connected in Metamask
                        dispatch('connectMetaMask')
                    }
                })
            }
        } else {
            // MetaMask not installed
            console.log('MetaMask is not installed')
            dispatch("metamaskUpdate", "NO_INSTALL_METAMASK")
        }
    },

    async connectMetaMask({ dispatch, commit }) {
        if (window.ethereum) {
            try {
                await window.ethereum.enable()
                commit("web3Update", new Web3(window.ethereum))
                dispatch("web3TimerCheck", false)
                window.ethereum.on("accountsChanged", () => dispatch("checkAccounts"))
                window.ethereum.on("chainChanged", () => dispatch("checkNetWork"))
                localStorage.setItem("AUTO_CONNECT_WALLET", "injected")
            } catch (error) {
                console.log('Error with ethereum: ', error)
                dispatch("metamaskUpdate", "USER_DENIED")
            }
        } else if (window.web3) {
            commit("web3Update", new Web3(window.web3.currentProvider))
            dispatch("web3TimerCheck", true)
            localStorage.setItem("AUTO_CONNECT_WALLET", "injected")
        } else {
            commit("web3Update", null)
            dispatch("metamaskUpdate", "NO_INSTALL_METAMASK")
            console.error('Non-Ethereum browser detected. You should consider trying MetaMask!')
            return
        }
    },

    logout() {
        localStorage.removeItem("AUTO_CONNECT_WALLET")
        Scheduler.clearTimers()
        window.location.reload()
    },

    web3TimerCheck({ dispatch }, interval) {
        dispatch("checkAccounts")
        dispatch("checkNetWork")
        if(interval) {
            Scheduler.set('Account:connect', setInterval(() => dispatch("checkAccounts"), 3000))
            Scheduler.set('Account:network', setInterval(() => dispatch("checkNetWork"), 3000))
        }
    },

    checkAccounts({ dispatch, commit, state }) {
        if (state.web3 === null) return
        state.web3.eth.getAccounts((err, accounts) => {
            if (err != null) {
                dispatch("metamaskUpdate", "NETWORK_ERROR")
            }
            if (accounts.length === 0) {
                commit("walletUpdate", null)
                dispatch("metamaskUpdate", "NO_LOGIN")
                return
            }
            commit("walletUpdate", accounts[0])
        })
    },

    async checkNetWork({ dispatch, commit, state, getters }) {
        if (state.web3 === null) return
        state.web3.eth.net.getId((err, netID) => {
            if (err != null) {
                console.log(err);
                commit("metamaskUpdate", { status: 'NETWORK_ERROR', getters })
            }
            dispatch("checkAccounts")
            if (state.userAddress) {
                console.log(netID);
                if (netID === CHAIN_ID) {
                    dispatch("metamaskUpdate", CHAIN_NAME)
                } else {
                    dispatch("metamaskUpdate", "WRONG_NETWORK")
                }
            }
        })
    },

    async SwitchNetWork({ state }) {
        if (state.metamaskStatus === 'WRONG_NETWORK') {
            try {
                const provider = window.ethereum
                await provider.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: `0x${parseInt(CHAIN_ID, 10).toString(16)}`,
                            chainName: CHAIN_NAME,
                            nativeCurrency: CURRENCY_SYMBOL,
                            rpcUrls: [RPC_URL],
                            blockExplorerUrls: [EXPLORER_URL],
                        },
                    ],
                })
            } catch (error) {
                console.log(error);
                return
            }
        }
    },

    metamaskUpdate({dispatch, commit, state, getters}, status) {
        if (state.metamaskStatus === status) {
            // Status did not change
            return
        }
        if (status === CHAIN_NAME) {
            // if (getters.notLogon || getters.wrongNetwork) {
            //     // User just logged in, let's reload the page
            //     console.log("Metamask", 'User just logged in, reload page')
            //     window.location.reload()
            //     return
            // }
            // User was already logged in before,let's proceed
            commit("metamaskStatus", status)
            dispatch("getBalance")
            return
        } else {
            if (status === 'WRONG_NETWORK') {
                console.error('Wrong network, not on chain '+ CHAIN_ID)
            }
            commit("walletUpdate", undefined)
        }
        commit("metamaskStatus", status)
    },

    async getBalance({ commit, state, getters }) {
        if(getters.connected) {
            const balanceETH = await state.web3.eth.getBalance(state.userAddress)
            const Player = await RPC.getPlayer(state.userAddress)
            commit('balanceToken', Player.point)
            commit('balanceETHUpdate', balanceETH / Math.pow(10, 18))
        }
    },

    async deposit({ dispatch, commit, state, getters }, { vm, amount }) {
        if(!getters.connected) return
        vm.sending = true
        const contract = new state.web3.eth.Contract(abi, CONTRACT_ADDRESS);
        const pricePerPoint = await RPC.pricePerPoint();
        const realETH = amount / pricePerPoint * 1e18;
        const gasAmount = await contract.methods.deposit()
            .estimateGas({value: realETH, from: state.userAddress})
            .catch((error) => {
                console.log("Deposit", error);
                vm.$bvToast.toast(`Error ${error.message}`, {
                    title: 'Deposit',
                    variant: "danger",
                    autoHideDelay: 5000,
                    appendToast: true
                })
            })
        await contract.methods.deposit().send({
                from: state.userAddress,
                value: realETH,
                gas: gasAmount
            })
            .once('transactionHash', (hash) => {
                console.log("transactionHash", hash);
            })
            .once('confirmation', (confirmationNumber, receipt) => {
                console.log("confirmation", confirmationNumber, receipt);
                vm.$bvToast.toast(`Transaction Confirmation`, {
                    title: 'Deposit',
                    variant: "success",
                    autoHideDelay: 5000,
                    appendToast: true
                })
            })
            .catch((error) => {
                console.log("Deposit", error);
                vm.$bvToast.toast(`Error ${error.message}`, {
                    title: 'Deposit',
                    variant: "danger",
                    autoHideDelay: 5000,
                    appendToast: true
                })
            })
        dispatch("getBalance");
        vm.$bvModal.hide('addMoney')
        vm.sending = false
    },

    async playGame({ state, getters }, { vm, type }) {
        if(!getters.connected) return
        vm.pendingTx = true
        const contract = new state.web3.eth.Contract(abi, CONTRACT_ADDRESS);
        const gasAmount = await contract.methods.betGame(state.betAmount, type)
            .estimateGas({from: state.userAddress})
            .catch((error) => {
                console.log("PlayGame", error);
                vm.$bvToast.toast(`Error ${error.message}`, {
                    title: 'PlayGame',
                    variant: "danger",
                    autoHideDelay: 5000,
                    appendToast: true
                })
            })
        await contract.methods.betGame(state.betAmount, type)
        .send({from: state.userAddress, gas: gasAmount})
        .once('transactionHash', (hash) => {
            vm.status.body = "Transacion sending..."
            console.log("transactionHash", hash);
        })
        .once('confirmation', (confirmationNumber, receipt) => {
            console.log("confirmation", confirmationNumber, receipt);
            vm.status.body = "Confirm transaction..."
            vm.$bvToast.toast(`Transaction Confirmation`, {
                title: 'PlayGame',
                variant: "success",
                autoHideDelay: 5000,
                appendToast: true
            })
            vm.confirmBet();
        })
        .catch((error) => {
            console.log("PlayGame", error);
            vm.status.body = "Play game error"
            vm.$bvToast.toast(`Error ${error.message}`, {
                title: 'PlayGame',
                variant: "danger",
                autoHideDelay: 5000,
                appendToast: true
            })
        })
        vm.pendingTx = false
    },

    async withdraw({ dispatch, getters, state }, {vm, value}) {
        if(!getters.connected) return
        if(state.balanceToken < value) return
        vm.pending = true
        const contract = new state.web3.eth.Contract(abi, CONTRACT_ADDRESS);
        const gasAmount = await contract.methods.withdraw(value)
            .estimateGas({from: state.userAddress})
            .catch((error) => {
                console.log("Withdraw", error);
                vm.$bvToast.toast(`Error ${error.message}`, {
                    title: 'Withdraw',
                    variant: "danger",
                    autoHideDelay: 5000,
                    appendToast: true
                })
            })
        await contract.methods.withdraw(value)
        .send({from: state.userAddress, gas: gasAmount})
        .once('transactionHash', (hash) => {
            console.log("transactionHash", hash);
        })
        .once('confirmation', (confirmationNumber, receipt) => {
            console.log("Withdraw", confirmationNumber, receipt);
            vm.$bvToast.toast(`Transaction Confirmation`, {
                title: 'Withdraw',
                variant: "success",
                autoHideDelay: 5000,
                appendToast: true
            })
        })
        .catch((error) => {
            console.log("Withdraw", error);
            vm.$bvToast.toast(`Error ${error.message}`, {
                title: 'Withdraw',
                variant: "danger",
                autoHideDelay: 5000,
                appendToast: true
            })
        })
        dispatch("getBalance")
        vm.pending = false
        vm.withdrawPoint = null
    }
}

export default new Vuex.Store({
    state,
    getters,
    mutations,
    actions
})

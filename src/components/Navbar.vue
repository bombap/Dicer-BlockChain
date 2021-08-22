<template>
    <header>
        <nav class="navbar py-0 sticky-top bg-white border-bottom navbar-expand-lg navbar-light">
            <div class="container">
                <a class="navbar-brand font-weight-bold" href="#">DICER</a>
                <div class="collapse navbar-collapse ml-4" id="navbarTogglerDemo02">
                    <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
                        <router-link
                            v-for='item in links'
                            :key='item.title'
                            tag="li"
                            class="nav-item"
                            active-class="active"
                            :to="item.link"
                            exact
                        >
                            <a class="nav-link smallerFSize">{{item.title}}</a>
                        </router-link>
                    </ul>
                    <div v-if="$root.noMetamask" class="py-1">
                        <div class="btn btn-special px-3 btn-nav" @click="installMetamask">
                            <img src="@/assets/metamaskIcon.png" width="20" class="mr-2">
                            <small class='light-font text-warning'>NO METAMASK</small>
                        </div>
                    </div>
                    <div v-else-if="$root.wrongNetwork" class="py-1">
                        <div class="btn btn-special px-3 btn-nav" @click="switchNetWork">
                            <small class='light-font text-warning'>WRONG NETWORK</small>
                        </div>
                    </div>
                    <div v-else-if="$root.connected && $root.userAddress" class="form-inline my-2 my-lg-0">
                        <b-avatar class="mr-2" :src="avatarIMG"></b-avatar>
                        <div class="d-flex flex-column">
                            <div>
                                <small class="text-muted">{{addressSplice($root.userAddress)}}</small>
                            </div>
                            <div>
                                <h5><IOdometer class="iOdometer" :value="Number($root.balanceToken)"/></h5>
                            </div>
                        </div>
                        <svg @click="$bvModal.show('modal-settings')" viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class='ml-1 mr-4 pointer'>
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                        <div v-if="$root.notLogon" class="btn btn-special px-3 btn-nav">
                            <small class='light-font'>CONNECT WALLET</small>
                        </div>
                        <div @click="$bvModal.show('addMoney')" class="btn bg-primary2 px-3 btn-nav">
                            <small class='text-light'>DEPOSIT</small>
                        </div>
                    </div>
                    <div v-else class="py-1">
                        <div class="btn btn-special px-3 btn-nav" @click="connectMetaMask">
                            <img src="@/assets/metamaskIcon.png" width="20" class="mr-2">
                            <small class='light-font'>CONNECT WALLET</small>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
        <b-modal id="modal-settings" title="Settings" hide-footer centered>
            <p><strong>Wallet Address: </strong> {{ $root.userAddress }}</p>
            <p><strong>Balance ETH: </strong> {{ prettyNumber($root.balanceETH, 6) }}</p>
            <p><strong>Point: </strong> {{ prettyNumber($root.balanceToken, 4) }}</p>
            <p><strong>Total Win: </strong> {{ $root.totalWon }}</p>
            <p><strong>Total Played: </strong> {{ $root.totalPlayed }}</p>
            <b-input-group prepend="Withdraw" class="mt-3">
                <b-form-input type="number" v-model="withdrawPoint" placeholder="Enter your point" :disabled="pending"></b-form-input>
                <b-input-group-append>
                    <b-button variant="info" :disabled="!withdrawPoint || !validation || pending" @click="withdraw">Confirm</b-button>
                </b-input-group-append>
            </b-input-group>
            <b-form-invalid-feedback :state="validation">{{textError}}</b-form-invalid-feedback>
            <b-form-valid-feedback :state="validation">{{estimateETH}}</b-form-valid-feedback>
            <button @click='logout' data-dismiss="modal" class='col-12 btn btn-primary' :disabled="pending">Disconnect Wallet</button>
        </b-modal>
        <MoneyModal @clicked='getNumber'/>
        <div class='d-lg-none d-flex justify-content-center w-100 border-bottom px-3 bg-white'>
            <div v-if="$root.noMetamask" class="py-1">
                <div class="btn btn-special px-3 btn-nav" @click="installMetamask">
                    <img src="@/assets/metamaskIcon.png" width="20" class="mr-2">
                    <small class='light-font text-warning'>NO METAMASK</small>
                </div>
            </div>
            <div class="py-1" v-else-if="$root.wrongNetwork">
                <div class="btn btn-special px-3 btn-nav" @click="switchNetWork">
                    <small class='light-font text-warning'>WRONG NETWORK</small>
                </div>
            </div>
            <div v-else-if="$root.connected && $root.userAddress" class="container px-0 form-inline">
                <div @click="$bvModal.show('addMoney')" class="btn bg-primary2 px-3 btn-nav smallerFSize">
                    <small class='text-light'>DEPOSIT</small>
                </div>
                <div class="ml-2 d-flex flex-column">
                    <div>
                        <small class="text-muted">{{addressSplice($root.userAddress)}}</small>
                    </div>
                    <div>
                        <h5><IOdometer class="iOdometer" :value="Number($root.balanceToken)"/></h5>
                    </div>
                </div>
                <svg @click="$bvModal.show('modal-settings')" viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class='ml-1 mr-4 pointer'>
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </div>
            <div class="py-1" v-else>
                <div class="btn btn-special px-3 btn-nav" @click="connectMetaMask">
                    <img src="@/assets/metamaskIcon.png" width="20" class="mr-2">
                    <small class='light-font'>CONNECT WALLET</small>
                </div>
            </div>
        </div>
    </header>
</template>

<script>
import MoneyModal from './navComponents/AddMoney'
import IOdometer from 'vue-odometer'
import 'odometer/themes/odometer-theme-default.css'
import blockies from 'ethereum-blockies-png'
import { addressSplice, prettyNumber } from "@/utils"
export default {
    name: 'Navbar',
    props: {
        activePage: String,
    },
    components: {
        MoneyModal, IOdometer
    },
    data: () => ({
        links: [
            {title: "Play", link: "/"},
            {title: "Statistics", link: "/stats"}
        ],
        pending: false,
        withdrawPoint: null,
        textError: null
    }),
    computed: {
        avatarIMG() {
            if(this.$root.connected && this.$root.userAddress)
                return blockies.createDataURL({ seed: this.$root.userAddress })
            else return blockies.createDataURL({ seed: "0x000000000000000000000000000000000000dead" })
        },
        validation() {
            if(this.withdrawPoint == null) return true
            else if(this.withdrawPoint < 100) {
                this.textError = "Withdraw minimun 100 Points"
                return false
            }
            else if(this.withdrawPoint > this.$root.balanceToken) {
                console.log(this.withdrawPoint, this.$root.balanceToken);
                this.textError = "Insufficient Point"
                return false
            }
            else return true
        },
        estimateETH() {
            if(!this.validation) return
            if(!this.withdrawPoint) return
            let amountETH = this.withdrawPoint / 1000
            return `${prettyNumber(amountETH)} ETH`
        }
    },
    methods: {
        addressSplice,
        prettyNumber,
        async getNumber(num) {
            this.$store.state.score = Number(num) + Number(this.$store.state.score);
            await this.$store.dispatch('updateBill', {
                bill: this.$store.state.score
            })
        },
        async logout() {
            await this.$store.dispatch('logout')
        },
        switchNetWork() {
            this.$store.dispatch("SwitchNetWork")
        },
        connectMetaMask() {
            this.$store.dispatch("connectMetaMask")
        },
        installMetamask() {
            return window.open("https://metamask.io/", "_blank");
        },
        withdraw() {
            this.$store.dispatch("withdraw", {vm: this, value: this.withdrawPoint})
        }
    },
}
</script>

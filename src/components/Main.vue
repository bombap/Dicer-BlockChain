<template>
    <div class="py-lg-5 py-3 d-flex">
        <div class="m-auto container px-lg-3 px-sm-0 px-3">
            <div class="rounded h-box-block bshadow border px-0 py-2 mx-auto bg-white">
                <div class="border-bottom d-sm-block d-none py-3">
                    <h4 class="mx-3 font-weight-normal"><b-icon icon="x-diamond"></b-icon> Roulette</h4>
                </div>
                <div class='row pt-4 pb-3'>
                    <Roulette :isSpinning.sync="isSpinning" :status.sync="status" @updateWarings="updateWarings"/>
                    <Inputs :isSpinning="isSpinning" :pendingTx="pendingTx" />
                    <div class="col-lg-12 px-sm-5 px-4 text-center col-12">
                        <div class="col-12 mt-3 px-0 mx-auto row">
                            <div class="col-4 px-0 pr-2">
                                <small class='text-muted font-weight-light'>Potencial profit: x2</small>
                                <button :disabled="isSpinning || pendingTx" @click='playGame(1)' class='btn smallerFSize font-weight-light mt-2 btn-danger col-12 py-2'>1 to 7</button>
                            </div>
                            <div class="col-4 px-0 pr-2">
                                <small class='text-muted font-weight-light'>Potencial profit: x13</small>
                                <button :disabled="isSpinning || pendingTx" @click='playGame(0)' class='btn smallerFSize font-weight-light mt-2 btn-success col-12 py-2'>0</button>
                            </div>
                            <div class="col-4 px-0 pl-2">
                                <small class='text-muted font-weight-light'>Potencial profit: x2</small>
                                <button :disabled="isSpinning || pendingTx" @click='playGame(2)' class='btn smallerFSize font-weight-light mt-2 btn-dark col-12 py-2'>8 to 14</button>
                            </div>
                        </div>
                        <div
                            v-for='warning in warnings'
                            :key='warning.message'
                            :class='{"bg-success2": warning.greenColor, "bg-danger": !warning.greenColor}'
                            class="py-special rounded justify-content-center mt-3 mx-auto"
                        >
                            <h6 class='text-light py-1 smallerFSize font-weight-light mb-0'>{{warning.message}}</h6>
                        </div>
                    </div>
                </div>
            </div>
            <History :lastGames='lastGames'/>
        </div>
    </div>
</template>

<script>
import Roulette from './mainComponents/Roulette'
import Inputs from './mainComponents/Inputs'
import History from './mainComponents/History'
import RPC from '@/Services/RPC'
import { addressSplice, prettyNumber } from "@/utils"
import { mapState } from 'vuex'

export default {
    name: 'Main',
    components: {
        Roulette, Inputs, History
    },
    data: () => ({
        successValue: 1.25,
        lastSuccessValue: 0, 
        lastNum: 0, 
        minValue: 799999, 
        maxValue: 200000, 
        success: false, 
        warnings: [],
        status: {
            body: 'Waiting for bets...',
            loading: true
        },
        lastGames: [
            {},{},{},{},{},{},{},{},{},{},{},{},{},{}
        ],
        pendingTx: false,
        startPining: false,
        isSpinning: false,
        lastGameData: null,
        eventsHash: new Set()
    }),
    computed: {
        ...mapState([
            'web3',
            'betAmount',
            'totalWon',
            'totalPlayed',
            'lastGameId'
        ]),
    },
    created() {
        this.loadLastGame()
        RPC.contractWS.events.Deposit({fromBlock:'latest'}, (err, event) => {
            if(err) {
                console.log(err);
            } else {
                if(this.eventsHash.has(event.transactionHash)) return
                console.log("contractWS", event);
                this.$bvToast.toast(
                    `${addressSplice(event.returnValues[0])} deposit ${prettyNumber(event.returnValues[1], 2)} Points`, 
                {
                    title: `Someone Just Deposit`,
                    variant: "success",
                    autoHideDelay: 5000,
                    appendToast: true
                })
                this.eventsHash.add(event.transactionHash)
            }
        })
        RPC.contractWS.events.PlayGame({fromBlock:'latest'}, (err, event) => {
            if(err) {
                console.log(err);
            } else {
                if(this.eventsHash.has(event.transactionHash)) return
                console.log("contractWS", event);
                let returnValues = event.returnValues
                let game = {
                    player: returnValues[0],
                    point: returnValues[1],
                    seed: returnValues[2],
                    won: returnValues[3]
                }
                if(returnValues[0].toLowerCase() == this.$root.userAddress.toLowerCase()) {
                    setTimeout(() => {this.pushLastGame(game)}, 10000);
                }else {
                    this.pushLastGame(game)
                }
                this.eventsHash.add(event.transactionHash)
            }
        })
    },
    methods: {
        async loadLastGame() {
            const lastGame = await RPC.last20Game()
            lastGame.forEach(game => {
                if(game.player !== "0x0000000000000000000000000000000000000000") {
                    this.pushLastGame(game)
                }
            })
        },
        pushLastGame(game) {
            this.lastGames.unshift({
                user: game.player,
                sum: game.point,
                coef: `x${game.seed == 0 ? "13" : "2"}`,
                result: !game.won ? 0 : game.point,
                color: !game.won ? "#000" : "#3bbc73",
                show: true
            });
            this.lastGames.pop();
        },
        emptyWarnings() {
            this.success = false;
            this.warnings = [];
        },
        async getRecentGames() {
            
        },

        async playGame(type) {
            let e = this
            if(!this.$root.connected) return
            this.emptyWarnings();
            if(this.betAmount <= this.$root.balanceToken ) {
                if(this.betAmount >= 0.01) {
                    this.status.body = "Waitting confirm Metamask..."
                    this.$store.dispatch("playGame", { vm: this, type })
                } else {
                    this.warnings.push({
                        message: 'Bets from 0.01 point',
                        greenColor: false
                    });
                }
            } else {
                this.warnings.push({
                    message: 'Insufficient funds',
                    greenColor: false
                });
            }
        },

        async confirmBet() {
            const Player = await RPC.getPlayer(this.$root.userAddress)
            this.status.body = "Ready to spin"
            if(Player.lastGameId !== this.lastGameId) {
                this.$store.commit("updatePlayer", {
                    totalWon: Player.totalWon,
                    totalPlayed: Player.totalPlayed,
                    lastGameId: Player.lastGameId,
                })
                const gameData = await RPC.gameHistory(Player.lastGameId)
                this.lastGameData = gameData
                this.$root.$emit('startSpin', gameData.spin)
            }
        },

        async updateWarings() {
            if(this.lastGameData.won) {
                let point = this.lastGameData.seed == 0 ? this.lastGameData.point * 13 : this.lastGameData.point
                this.warnings.push({
                    message: `Won ${point} points`,
                    greenColor: true
                });
            } else {
                this.warnings.push({
                    message: `Dropped ${this.lastGameData.point} points`,
                    greenColor: false
                });
            }
            // await this.loadLastGame();
        },
    }
}
</script>

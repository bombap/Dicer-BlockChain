<template>
    <div class="row mx-0 px-md-5 px-sm-5 px-4 col-lg-12 col-12">
        <div class="px-0 col-12">
            <div class="recent-spins-wrapper">
                <span class="d-flex justify-content-between align-items-center">
                    <h6>Recent spins</h6>
                    <div class="h6">
                        <span>Status: </span>
                        <span class="font-weight-light">
                            {{ status.body }}
                            <i v-show="status.loading" class="fa fa-spinner fa-spin"></i>
                        </span>
                    </div>
                </span>
                <div v-if="recentSpins.length > 0" class="recent-spins">
                    <div v-for="(recentSpin, index) in recentSpins" :key="index"
                        :style="[recentSpinStyles, { backgroundColor: recentSpin.color }]" class="recent-spin">
                        {{ recentSpin.title }}
                    </div>
                </div>
                <div v-else>
                    <div class="alert alert-info">
                        There are no previous spins in our history. Make the first one!
                    </div>
                </div>
            </div>
        </div>
        <app-spin-roulette :items="items" :items-component="'app-roulette-item'" :index="index" :settings="settings"
            :isSpinning="isSpinning" @spinned="finishSpin">
        </app-spin-roulette>
    </div>
</template>

<script>
import SpinRoulette from './SpinRoulette.vue'
export default {
    props: ["isSpinning", "status"],
    components: {
        'app-spin-roulette': SpinRoulette,
    },
    data() {
        return {
            settings: {
                item: {
                    width: 70,
                    height: 70
                },
                roulette: {
                    widthInItems: 15,
                    spin: {
                        time: 5000,
                        delay: 500
                    }
                }
            },
            colors: {
                first: {
                    role: 'first',
                    title: 'red',
                    color: '#b04a43',
                    fontColor: '#000',
                    diapason: '1 to 7',
                    bets: 0
                },
                third: {
                    role: 'third',
                    title: 'green',
                    color: '#6fb26b',
                    fontColor: '#000',
                    diapason: '0',
                    bets: 0
                },
                second: {
                    role: 'second',
                    title: 'black',
                    color: '#444',
                    fontColor: '#000',
                    diapason: '8 to 14',
                    bets: 0
                }
            },
            items: [],
            index: null,
            item: null,
            bet: {
                amount: 0
            },
            betsResults: {},
            profit: 0,
            recentSpins: [],
            recentSpinsLimit: 10,
        }
    },
    created() {
        if(this.$isMobile()) {
            this.settings.roulette.widthInItems = 6
        }
        this.items = this.generateRouletteLine(1)
        this.$root.$on('startSpin', this.startSpin)
    },
    computed: {
        recentSpinStyles () {
            return {
                width: `${Math.ceil(this.settings.item.width / 1.5)}px`,
                height: `${Math.ceil(this.settings.item.height / 1.5)}px`,
                lineHeight: `${Math.ceil(this.settings.item.height / 1.5)}px`
            }
        }
    },
    methods: {
        getRandomArbitrary(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        startSpin(spinNumber) {
            this.profit = 111
            const listNumber = [1, 14, 2, 13, 3, 12, 4, 0, 11, 5, 10, 6, 9, 7, 8];
            const number = listNumber.findIndex(n => n == spinNumber)
            const round = this.getRandomArbitrary(4, 25)
            this.items = this.generateRouletteLine(round)
            this.index = parseInt((this.items.length - 30) + number)
            this.item = this.items[this.index]
            this.$emit('update:status', {
                body: "Spinning...",
                loading: true
            })
            this.$emit('update:isSpinning', true)
        },

        finishSpin() {
            this.$emit('update:isSpinning', false)
            this.$emit("updateWarings")
            this.$store.dispatch("getBalance")
            if (this.recentSpins.unshift(this.item) > this.recentSpinsLimit) {
                this.recentSpins.pop()
            }
            for (const key of Object.keys(this.colors)) {
                if (this.colors[key].bets > 0) {
                    if (this.betsResults[key]) {
                        this.colors[key].bets = `+${this.betsResults[key]}`
                        this.colors[key].fontColor = 'green'
                    } else {
                        this.colors[key].bets = -Math.abs(this.colors[key].bets)
                        this.colors[key].fontColor = 'red'
                    }
                }
            }
            let statusBody = `Rolled ${this.item.title}, ${this.item.group}!`
            statusBody = this.item.group === 'green' ? 'Rare thing! ' + statusBody : statusBody
            let statusLoading = false
            
            this.$emit('update:status', {
                body: statusBody,
                loading: statusLoading
            })
        },

        generateRouletteLine(linesAmount) {
            let iterationsAmount = linesAmount * 7
            let limit = 15
            let resetAt = 8
            let currentIndex = 1
            let itemsArray = []
            for (let i = 0; i < iterationsAmount; i++, currentIndex++) {
                if (currentIndex === resetAt) {
                    currentIndex = 1
                }
                itemsArray.push({
                    title: currentIndex,
                    color: this.colors.first.color,
                    group: this.colors.first.title
                })
                if (currentIndex === 4) {
                    itemsArray.push({
                        title: 0,
                        color: this.colors.third.color,
                        group: this.colors.third.title
                    })
                }
                itemsArray.push({
                    title: limit - currentIndex,
                    color: this.colors.second.color,
                    group: this.colors.second.title
                })
            }
            return itemsArray
        },
    }

}
</script>

<style>
.recent-spins-wrapper {
    margin-bottom: 15px;
}

.recent-spins {
    margin: 0 auto;
    display: inline-block;
}

.recent-spin {
    float: left;
    margin-right: 10px;
    border-radius: 50%;
    color: #fff;
    font-size: 1.2em;
    text-align: center;
    user-select: none;
}

.control-buttons {
    margin-top: 20px;
    display: inline-block;
}

.control-item-button:hover {
    /*background: attr(data-color, #d6d6d6);*/
    background-color: currentColor;
}

.control-item-button span {
    /*.control-item-button span:hover {*/
    color: #000;
}

.control-item-button:hover span {
    /*.control-item-button span:hover {*/
    color: #fff;
}

.control-item {
    float: left;
    margin-right: 5px;
    border-radius: 10px;
}

.control-item-balance {
    cursor: default;
}

/*.control-item-balance:active:focus,*/
/*.control-item-balance:focus,*/
/*.control-item-balance:active,*/
/*.control-item-balance:visited,*/
/*.bet-color-btn:hover:active:focus,*/
/*.bet-color-btn:hover:focus,*/
/*.bet-color-btn:hover:hover,*/
/*.bet-color-btn:hover:visited,*/
/*.bet-color-btn:hover:active {*/
/*color: #fff;*/
/*}*/

.control-input {
    width: 130px;
    text-align: center;
}

.btn-primary {
    margin: 20px auto 30px;
}

.control-item-balance,
.control-item-balance:hover,
.control-input {
    color: #fff;
}

</style>
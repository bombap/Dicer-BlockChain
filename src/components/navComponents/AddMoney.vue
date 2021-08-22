<template>
    <b-modal id="addMoney" title="Add Money" centered cancel-disabled ok-only ok-title="Close">
        <b-overlay :show="sending" rounded="sm">
            <div class="container list-price text-center">
                <h6>1 Point = 0.001 ETH</h6>
                <div class="row">
                    <div @click='updateScore(10)' class="col-lg col-12">
                        <h2>+10</h2>
                    </div>
                    <div @click='updateScore(50)' class="col-lg col-12 my-lg-0 my-2 mx-lg-3">
                        <h2>+50</h2>
                    </div>
                    <div @click='updateScore(100)' class="col-lg col-12">
                        <h2>+100</h2>
                    </div>
                </div>
                <div class="row mt-lg-5 mt-2">
                    <div @click='updateScore(500)' class="col-lg col-12">
                        <h2>+500</h2>
                    </div>
                    <div @click='updateScore(1000)' class="col-lg col-12 my-lg-0 my-2 mx-lg-3">
                        <h2>+1000</h2>
                    </div>
                    <div @click='updateScore(2000)' class="col-lg col-12">
                        <h2>+2000</h2>
                    </div>
                </div>
            </div>
        </b-overlay>
    </b-modal>
</template>

<script>
export default {
    name: 'AddMoneyModal',
    data() {
        return {
            sending: false
        }
    },
    methods: {
        updateScore: function(num) {
            this.$store.dispatch("deposit", {vm: this, amount: num})
        }
    }
}
</script>

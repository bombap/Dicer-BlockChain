<template>
    <div class="row justify-content-md-center pt-4 mx-0 px-md-5 px-sm-5 px-4 col-lg-12 col-12">
        <div class="px-0 pr-2 col-lg-4 col-md-6 col-sm-12">
            <input :disabled="isSpinning || pendingTx" v-model='betAmount' type="number" class='col-12 p-2 border px-0 text-center' placeholder="Bet">
            <div class="row input-controls mx-auto">
                <button :disabled="isSpinning || pendingTx" @click='betAmount = $root.balanceToken' class='col-3 p-2 light-font px-0 border-left border-bottom border-right'>Max</button>
                <button :disabled="isSpinning || pendingTx" @click='betAmount = "0.01"' class='col-3 p-2 light-font px-0 border-bottom border-right'>Min</button>
                <button :disabled="isSpinning || pendingTx" @click='betAmount = parseFloat((betAmount*2).toFixed(2))' class='col-3 p-2 light-font px-0 border-bottom border-right'>x2</button>
                <button :disabled="isSpinning || pendingTx" @click='betAmount = parseFloat((betAmount/2).toFixed(2))' class='col-3 p-2 light-font px-0 border-bottom border-right'>/2</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "ChanceInput",
    props: ["isSpinning", "pendingTx"],
    data() {
        return {
            betAmount: this.$store.state.betAmount,
        }
    },
    watch: {
        betAmount: function() {
            this.betAmount > 1000000 ? this.betAmount = 1000000 : true;
            if(this.betAmount.length != 0) {
                let str = String(this.betAmount);
                let arr = str.split('.');
                if(arr[1] != undefined) {
                    if(arr[1].length > 2) {
                        this.betAmount = arr[0]+'.'+arr[1].substr(0,2);
                    }
                }
            }
            this.$store.commit('updateBetAmount', this.betAmount);
        }
    }
}
</script>
<style>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    /* display: none; <- Crashes Chrome on hover */
    -webkit-appearance: none;
    margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
}

input[type=number] {
    -moz-appearance:textfield; /* Firefox */
}
</style>
<template>
    <div class="d-md-block d-none rounded bshadow border mt-3 px-0 py-2 mx-auto bg-white">
        <h6 class='mx-3 pt-2 pb-3 smallerFSize'>Recently Bets</h6>
        <table class="table mb-0 text-center">
            <thead>
                <tr>
                    <th scope="col">GAME</th>
                    <th scope="col">PLAYER</th>
                    <th scope="col">BET</th>
                    <th scope="col">COEFFICIENT</th>
                    <th scope="col">RESULT</th>
                </tr>
            </thead>
            <tbody>
            <tr class='h-special' v-for="(item, i) in lastGames" :key='`game-${i}`'>
                <th scope="row"><b-icon v-show="item.show" icon="x-diamond"></b-icon></th>
                <td v-b-tooltip.hover :title="item.user">{{ item.user ? addressSplice(item.user) : item.user }}</td>
                <td>{{item.sum ? prettyNumber(item.sum, 2) : item.sum}}</td>
                <td>{{item.coef}}</td>
                <td :style="{ color: item.color }">{{typeof item.result !== "undefined" ? prettyNumber(item.result, 2) : item.result}}</td>
            </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { addressSplice, prettyNumber } from "@/utils"
export default {
    name: "History",
    props: {
        lastGames: Array
    },
    methods: {
        addressSplice,
        prettyNumber
    }
}
</script>

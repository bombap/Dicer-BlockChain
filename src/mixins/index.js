import { mapGetters, mapState } from 'vuex'

export default {
    computed: {
        ...mapState([
            'web3',
            'metamaskStatus',
            'userAddress',
            'balanceETH',
            'balanceToken',
            'loading',
            'totalWon',
            'totalPlayed',
        ]),
        ...mapGetters([
            'connected',
            'notLogon',
            'noMetamask',
            'wrongNetwork'
        ]),
    },
}
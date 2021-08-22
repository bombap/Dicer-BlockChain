<template>
    <div id="app">
        <div v-if='!$root.loading'>
            <router-view/>
        </div>
        <div v-else class='d-flex min-vh-100'>
            <div class="m-auto">
                <Loader size='5rem'/>
            </div>
        </div>
    </div>
</template>
<script>
import Scheduler from '@/Services/Scheduler'
export default {
    metaInfo() {
        let routeName = this.$route.name;
        return {
            title: routeName,
            titleTemplate: '%s - KhoaPham'
        }
    },
    mounted() {
        this.$store.dispatch('walletBoot')
    },
    beforeDestroy() {
        Scheduler.clearTimers()
    }
}
</script>
<style lang="scss">
</style>

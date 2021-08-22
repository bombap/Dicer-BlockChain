class Scheduler {
    intervals = [1, 5, 10, 30, 60]
    timers = {}

    set(name, callBack) {
        this.timers[name] = callBack
    }

    clearTimers() {
        Object.entries(this.timers).forEach((entry) => {
            const [, interval] = entry
            clearInterval(interval)
        })
        for (let prop in this.timers) {
            delete this.timers[prop]
        }
    }
}

export default new Scheduler()
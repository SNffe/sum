define(function() {
    class demo {
        constructor(x, y) {
            this.x = x
            this.y = y
        }
        log() {
            console.log(this.x + ' | ' + this.y)
        }
    }

    return {
        demo
    };
});
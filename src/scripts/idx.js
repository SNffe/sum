
!function(win, doc, undefined) {
    class Page {
        constructor() {

        }

        addEvent() {
            document.querySelectorAll('[data-href]').forEach(function(item, i) {
                item.addEventListener('click', function() {
                    if(!!item.getAttribute('data-href')) {
                        win.location.href = item.getAttribute('data-href')
                    }
                })
            })
        }

        init() {
            this.addEvent()
        }
    }
    
    new Page().init()

}(this || window, document)

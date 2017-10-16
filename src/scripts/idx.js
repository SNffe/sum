// loadingBar
!function(win, doc, undefined) {
    
class LoadingBar {
    constructor() {
        this.width = 0
        this.oLoadDiv = null
        this.init()
    }
    init() {
        this.creatStyle()
        this.creatLoadDiv()
    }
    creatLoadDiv() {
        let div = doc.createElement('div')
        div.id = '_loadingBar'
        doc.body.appendChild(div)
        this.oLoadDiv = doc.getElementById('_loadingBar')
    }

    over(dom){
        setTimeout(
            () => {
                dom.style.display = 'none'
                dom.style.width = 0
            }
    , 1100);
    }

    creatStyle() {
        let nod = doc.createElement('style'),   
            str = `#_loadingBar{transition:all 1s;
                -webkit-transition:all 1s;
                background-color:#f90;
                height: 3px;width:0; 
                position: fixed;
                top: 0;
                z-index: 99999;left: 0;font-size: 0;}
            .animation_paused{-webkit-animation-play-state:paused;
                animation-play-state:paused;};`
        nod.type = 'text/css'
        nod.styleSheet ? nod.styleSheet.cssText = str : nod.innerHTML = str;
        doc.getElementsByTagName('head')[0].appendChild(nod)
    }

    setWidth(w){
        if(!this.oLoadDiv){
            this.init()
        }
        let oLoadDiv = this.oLoadDiv,
            width = Number(w) || 100;
            oLoadDiv.style.display = 'block';
        /*防止后面写入的width小于前面写入的width*/
        // (width<this.width) ? width=this.width : this.width = width
        oLoadDiv.className = 'animation_paused'
        oLoadDiv.style.width = width + '%'
        oLoadDiv.className = ''

        if(width === 100){this.over(oLoadDiv)}
    }

}
window.LoadingBar = LoadingBar

}(this || window, document);

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
            var lb = new LoadingBar()
            window.onload = function() {
                lb.setWidth(100)
            }
        }
    }
    
    new Page().init()

}(this || window, document)

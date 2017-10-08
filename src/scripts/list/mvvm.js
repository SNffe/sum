!function(global, doc) {

    function Directive(el, mvvm, attr, elementValue) {
        this.el = el
        this.mvvm = mvvm
        this.attr = attr
        this.el[this.attr] = this.elementValue = elementValue
    }
    
    function set(target, key, value, receiver) {
        const result = Reflect.set(target, key, value, receiver)

        let dataSet = receiver || target
        dataSet.__bindings[key].forEach(function(item) {
            item.el[item.attr] = item.elementValue = value
        })

        return result
    }

    class mvvm {
        constructor(configs) {
            this.root = this.el = document.querySelector(configs.el)
            this._data = configs.data
            this._data.__bindings = {}

            this.data = new Proxy(this._data, {set})
            this.methods = configs.methods

            this._compile(this.root)
        }

        _compile(root) {
            let _this = this

            let nodes = root.children
            let bindDataTester = new RegExp("{{(.*?)}}", "ig")

            let node, 
                matches, 
                newMatches, 
                splitTextNodes,
                txt
            for(let i = 0; i < nodes.length; i++) {
                node = nodes[i]

                if(node.children.length) {
                    _this._compile(node)
                }

                matches = node.innerHTML.match(bindDataTester)
                if(matches) {
                    splitTextNodes = node.innerHTML.split(/{{.*?}}/)
                    node.innerHTML = null
                    if(splitTextNodes[0]) {
                        txt = document.createTextNode(splitTextNodes[0])
                        node.appendChild(txt)
                    }

                    newMatches = matches.map(function(item) {
                        return item.replace(/{{(.*?)}}/, "$1")
                    })
                    for(let j = 0; j < newMatches.length; j++) {
                        let el = document.createTextNode("")
                        node.appendChild(el)
                        if(splitTextNodes[j+1]) {
                            node.appendChild(document.createTextNode(splitTextNodes[j+1]))
                        }

                        let tmp2 = new Directive(el, this, "nodeValue", this.data[newMatches[j]])

                        if(this._data.__bindings[newMatches[j]]) {
                            this._data.__bindings[newMatches[j]].push(tmp2) 
                        } else {
                            this._data.__bindings[newMatches[j]] = [tmp2]
                        }

                    }
                }

                // input / textarea
                if(node.hasAttribute('p-model') && node.tagName.toUpperCase() === 'INPUT'
                ||
                node.tagName.toUpperCase() === 'TEXTAREA'
                ) {
                    node.addEventListener('input', (function() {
                        let attributeValue = node.getAttribute('p-model')
                        let tmp = new Directive(node, _this, "value", _this.data[attributeValue])
                        
                        if (_this._data.__bindings[attributeValue]) {
                            _this._data.__bindings[attributeValue].push(tmp);
                        }
                        else {
                            _this._data.__bindings[attributeValue] = [tmp];
                        }

                        return function(event) {
                            _this.data[attributeValue] = event.target.value
                        }
                    })())
                }


                if(node.hasAttribute('p-click')) {
                    node.addEventListener('click', (function() {
                        
                        let attributeValue = node.getAttribute('p-click')
                        let args = /\(.*\)/.exec(attributeValue)
                        if(args) {
                            args = args[0]
                            attributeValue = attributeValue.replace(args, '')
                            args = args.replace(/[\(\)\'\"]/g, '').split(',')
                        } else {
                            args = []
                        }

                        return function(event) {
                            _this.methods[attributeValue].apply(_this,[event, ...args])
                        }
                    })())
                }

            }
        }

    }

    global.mvvm = mvvm

}(this||window, document);
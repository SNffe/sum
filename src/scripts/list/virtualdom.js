!function(root, doc, undefined) {

    /* -------------------------------------
     velement
    -----------------------------------*/
    /**
     * 
     * ex:
     * new VElement(
     *  'h1', 
     *  {style: 'font-size: 14px; color: blue'}, 
     *  ['simple virtal dom']
     * )
     * 
     * @param {any} tagName 元素名称
     * @param {any} props  元素属性
     * @param {any} children 子元素
     * 
     * javascript 对象转为 dom元素
     */

    function VElement(tagName, props, children) {
        if (!(this instanceof VElement)) {
            if (!isArray(children) && children != null) {
              children = slice(arguments, 2).filter(function(value) {return !!value})
            }
            return new VElement(tagName, props, children)
          }
        
          if (isArray(props)) {
            children = props
            props = {}
          }

        this.tagName = tagName
        this.props = props
        this.children = children || []
    }

    VElement.prototype.render = function() {
        var el = doc.createElement(this.tagName)

        var props = this.props,
            propValue
        for (var propName in this.props) {
            propValue = props[propName]
            // el.setAttribute(propName, propValue)
            setAttr(el, propName, propValue)
        }

        var childEl
        this.children.forEach(function(child) {
            if(child instanceof VElement) {
                childEl = child.render()
            } else {
                childEl = doc.createTextNode(child)
            }
            el.appendChild(childEl)
        })

        return el
    }

    /* -------------------------------------
     patch
    --------------------------------------*/
    var REPLACE = 0
    var REORDER = 1
    var PROPS = 2
    var TEXT = 3

    // 修改dom
    function patch(node, patches) {
        var walker = {index: 0}
        patchwork(node, walker, patches)
    }

    function patchwork(node, walker, patches) {
        var currentPatches = patches['diff_'+ walker.index]
            , len = node.childNodes ? node.childNodes.length : 0
            , child
        
        for(var i = 0; i < len; i++) {
            child = node.childNodes[i]
            walker.index++
            patchwork(child, walker, patches)
        }

        if (currentPatches) {
            applyPatches(node, currentPatches)
        }
    }

    function applyPatches(node, currentPatches) {
        var newNode
        currentPatches.forEach(function(currentPatch) {
            switch (currentPatch.type) {
                case REPLACE:
                if(isString(currentPatch.node)) {
                    newNode = document.createTextNode(currentPatch.node)
                } else {
                    newNode = currentPatch.node.render()
                }
                node.parentNode.replaceChild(newNode, node)
                break

                case REORDER:
                reorderChildren(node, currentPatch.moves)
                break

                case PROPS:
                setProps(node, currentPatch.props)
                break

                case TEXT:
                if (node.textContent) {
                  node.textContent = currentPatch.content
                }
                break

                default:
                  throw new Error('type Error')
            }
        })
    }

    function reorderChildren(node, moves) {
        var staticNodeList = ([]).slice.call(node.childNodes)
        var maps = {}
      
        staticNodeList.forEach(function (node) {
          if (node.nodeType === 1) {
            var key = node.getAttribute('key')
            if (key) {
              maps[key] = node
            }
          }
        })
      
        moves.forEach(function (move) {
          var index = move.index
          if (move.type === 0) { // remove item
            if (staticNodeList[index] === node.childNodes[index]) { // maybe have been removed for inserting
              node.removeChild(node.childNodes[index])
            }
            staticNodeList.splice(index, 1)
          } else if (move.type === 1) { // insert item
            var insertNode = maps[move.item.key]
              ? maps[move.item.key].cloneNode(true) // reuse old item
              : (typeof move.item === 'object')
                  ? move.item.render()
                  : document.createTextNode(move.item)
            staticNodeList.splice(index, 0, insertNode)
            node.insertBefore(insertNode, node.childNodes[index] || null)
          }
        })
    }
    function setProps(node, props) {
        for (var key in props) {
            if (props[key] === void 0) {
                node.removeAttribute(key)
            } else {
                var value = props[key]
                setAttr(node, key, value)
            }
        }
    }

    patch.REPLACE = REPLACE
    patch.REORDER = REORDER
    patch.PROPS = PROPS
    patch.TEXT = TEXT

    /* -------------------------------------
    diff
    --------------------------------------*/

    // 对比新旧dom
    function diff(oldTree, newTree) {
        var index = 0,
            patches = {}
        diffwork(oldTree, newTree, index, patches)

        return patches
    }

    function diffwork(oldNode, newNode, index, patches) {
        var currentPatch = []
          if(isString(oldNode) && isString(newNode)) {
            if (newNode !== oldNode) {
                currentPatch.push({ type: patch.TEXT, content: newNode })
            }
        } else if(oldNode.tagName === newNode.tagName) {
            var propsPatches = diffProps(oldNode, newNode)
            if(propsPatches) {
                currentPatch.push({type: patch.PROPS, props: propsPatches})
            }
            
            diffChildren(
                oldNode.children, 
                newNode.children, 
                index, 
                patches, 
                currentPatch
            )
        } else {
            currentPatch.push({ type: patch.REPLACE, node: newNode })
        }

        if (currentPatch.length) {
            patches['diff_'+ index] = currentPatch
          }

    }

    // 对比元素属性
    function diffProps(oldNode, newNode) {
        var count = 0
            , oldProps = oldNode.props
            , newProps = newNode.props

        var key, value, propsPatches = {} // 存放变化的属性名和值

        for(key in oldProps) {
            value = oldProps[key]
            if(value !== newProps[key]) {
                count++
                propsPatches[key] = newProps[key]
            }
        }

        for(key in newProps) {
            value = newProps[key]
            if(!oldProps.hasOwnProperty(key)) { // newProps新增的属性
                count++
                propsPatches[key] = newProps[key]
            }
        }
        if(count === 0) return null  // 没变化

        return propsPatches
    }

    // 子元素对比
    function diffChildren(oldChildren, newChildren, index, patches, currentPatch) {
        var leftNode = null
            , currentNodeIndex = index
            , newChild = null
        oldChildren.forEach(function(child, i) {
            newChild = newChildren[i]
            currentNodeIndex = (leftNode && leftNode.count)
            ? currentNodeIndex + leftNode.count + 1
            : currentNodeIndex + 1

            diffwork(child, newChild, currentNodeIndex, patches)

            leftNode = child
        })
    }

    function isString(str) {
        return ({}).toString.call(str) === "[object String]"
    }
    function isArray(arr) {
        return ({}).toString.call(arr) === "[object Array]"
    }
    function slice(arrayLike, index) {
        return ([]).slice.call(arrayLike, index)
    }

    function setAttr (node, key, value) {
        switch (key) {
          case 'style':
            node.style.cssText = value
            break
          case 'value':
            var tagName = node.tagName || ''
            tagName = tagName.toLowerCase()
            if (
              tagName === 'input' || tagName === 'textarea'
            ) {
              node.value = value
            } else {
              node.setAttribute(key, value)
            }
            break
          default:
            node.setAttribute(key, value)
            break
        }
      }

      

    root.VElement = VElement
    root.diff = diff
    root.patch = patch

}(this||window, document)
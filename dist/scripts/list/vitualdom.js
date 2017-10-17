
/**
 <ul class=”list”>

  <li>item 1</li>

  <li>item 2</li>

</ul>

==========>

{ 
    type: ‘ul’, props: { ‘class’: ‘list’ }, 
    children: [

    { type: ‘li’, props: {}, children: [‘item 1’] },

    { type: ‘li’, props: {}, children: [‘item 2’] }

    ] 
}
 
 */
'use strict';

!(function (win, doc) {

    function Ele(tagName, props, children) {
        this.tagName = tagName;
        this.props = props;
        this.children = children;
    }

    Ele.prototype.render = function () {
        var e = document.createElement(this.tagName); // 创建元素
        var props = this.props;

        for (var propName in props) {
            // 设置 DOM 属性
            var propValue = props[propName];
            e.setAttribute(propName, propValue);
        }

        var children = this.children || [];

        children.forEach(function (child) {
            var childE = child instanceof Element ? child.render() // 子节点也是虚拟 DOM，递归构建
            : document.createTextNode(child); // 字符串，构建文本节点

            e.appendChild(childE);
        });

        return e;
    };

    var ol = new Ele('ol', { id: 'ol-list' }, [new Ele('li', { 'class': 'item' }, ['Item 1'])
    // Ele('li', {class: 'item'}, ['Item 2']),
    // Ele('li', {class: 'item'}, ['Item 3'])
    ]);

    var olE = ol.render();
    console.log(olE);
    //   document.body.appendChild(olE);
})(undefined || window, document);
const game = document.getElementById('game');

export class Element {

    constructor() {
        this.type = "element";
    }

    makeElement(tag, classNames, style, id=null) {
        let element = document.createElement(tag);
        if (typeof classNames === 'string') {
            element.classList.add(classNames);
        } else {
            classNames.forEach(className => element.classList.add(className));
        }
        for (let key in style) {
            element.style[key] = style[key];
        } 
        if (id) {element.id = id;}
        return element;
    }

    render(element, targetNode) {
        targetNode.appendChild(element);
    }
}
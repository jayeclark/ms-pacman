export default class Element {
  constructor() {
    this.type = 'element';
    this.element = null;
  }

  // TODO: Convert to static method
  makeElement(tag, classNames, style, id = null) {
    const element = document.createElement(tag);

    if (typeof classNames === 'string') {
      element.classList.add(classNames);
    } else {
      classNames.forEach((className) => element.classList.add(className));
    }
    Object.keys(style).forEach((key) => {
      element.style[key] = style[key];
    });

    if (id) {
      element.id = id;
    }
    return element;
  }

  addTo(id) {
    const element = document.getElementById(id);
    element.appendChild(this.element);
  }
}

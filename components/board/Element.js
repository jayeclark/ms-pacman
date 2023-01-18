export default class Element {
  constructor() {
    this.type = 'element';
    this.element = null;
  }

  // TODO: Convert to static method
  makeElement({
    tag, classNames, style, id = null, append = false,
  }) {
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
    if (append) {
      this.element = element;
    }
    return element;
  }

  addTo(id) {
    const parentElement = document.getElementById(id);
    if (!parentElement) {
      throw Error('an element with that id does not exist in the document!');
    }
    const elementToAppend = this.element;
    parentElement.appendChild(elementToAppend);
    return true;
  }
}

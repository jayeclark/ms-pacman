export default class Element {
  constructor() {
    this.type = 'element';
    this.element = null;
    this.id = null;
    this.parentElement = null;
    this.childInstances = null;
    this.style = null;
    this.classNames = null;
    this.htmlTag = null;
  }

  // TODO: Convert to static method
  makeElement({
    tag, classNames, style, id, parentElement,
  }) {
    const element = document.createElement(tag || this.htmlTag);

    const classes = classNames || this.classNames;
    if (classes && typeof classes === 'string') {
      element.classList.add(classes);
    } else if (classes) {
      classes.forEach((className) => element.classList.add(className));
    }
    if (style) {
      Object.keys(style).forEach((key) => {
        element.style[key] = style[key];
      });
    } else if (this.style) {
      Object.keys(this.style).forEach((key) => {
        element.style[key] = this.style[key];
      });
    }

    if (id) {
      element.id = id;
    } else if (this?.id) {
      element.id = this.id;
    }

    if (parentElement && parentElement === this) {
      this.element = element;
    } else if (parentElement) {
      parentElement.appendChild(element);
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

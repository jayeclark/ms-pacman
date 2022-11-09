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
  makeElement(props) {
    const tag = props?.tag || this?.htmlTag;
    const classNames = props?.classNames || this?.classNames;
    const style = props?.style || this?.style;
    const id = props?.id || this?.id;
    const parentElement = props?.parentElement || this?.parentElement;

    if (!tag || !classNames || !style) {
      throw new Error('Unable to make element - missing required property!');
    }

    const element = document.createElement(tag);
    (typeof classNames === 'string' ? [classNames] : classNames).forEach((className) => element.classList.add(className));
    Object.keys(style).forEach((key) => {
      element.style[key] = style[key];
    });
    if (id) {
      element.id = id;
    }

    if (parentElement) {
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

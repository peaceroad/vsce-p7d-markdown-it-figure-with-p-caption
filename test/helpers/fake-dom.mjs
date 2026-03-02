const selectorPattern = /^([a-zA-Z0-9-]+)(?:\[name="([^"]+)"\])?$/;

const parseSelector = (selector) => {
  if (typeof selector !== 'string') return null;
  const trimmed = selector.trim();
  if (!trimmed) return null;
  const match = trimmed.match(selectorPattern);
  if (!match) return null;
  return {
    tagName: match[1].toUpperCase(),
    nameAttr: match[2] || null,
  };
};

const matchesSelector = (element, selector) => {
  const parsed = parseSelector(selector);
  if (!parsed) return false;
  if (!element || element.nodeType !== 1) return false;
  if (element.tagName !== parsed.tagName) return false;
  if (!parsed.nameAttr) return true;
  return element.getAttribute('name') === parsed.nameAttr;
};

class FakeNode {
  constructor(nodeType) {
    this.nodeType = nodeType;
    this.parentNode = null;
    this.childNodes = [];
    this.ownerDocument = null;
    this._textContent = '';
  }

  get textContent() {
    return this._textContent;
  }

  set textContent(value) {
    this._textContent = value == null ? '' : String(value);
  }

  appendChild(node) {
    if (!node) return node;
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
    node.parentNode = this;
    this.childNodes.push(node);
    return node;
  }

  insertBefore(node, referenceNode) {
    if (!node) return node;
    if (!referenceNode) return this.appendChild(node);

    const index = this.childNodes.indexOf(referenceNode);
    if (index === -1) return this.appendChild(node);

    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
    node.parentNode = this;
    this.childNodes.splice(index, 0, node);
    return node;
  }

  removeChild(node) {
    const index = this.childNodes.indexOf(node);
    if (index === -1) return node;
    this.childNodes.splice(index, 1);
    node.parentNode = null;
    return node;
  }
}

class FakeElement extends FakeNode {
  constructor(tagName, ownerDocument) {
    super(1);
    this.tagName = String(tagName || '').toUpperCase();
    this.ownerDocument = ownerDocument || null;
    this.attributes = new Map();
  }

  getAttribute(name) {
    if (!this.attributes.has(name)) return null;
    return this.attributes.get(name);
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name === 'alt') this._alt = String(value);
    if (name === 'title') this._title = String(value);
  }

  hasAttribute(name) {
    return this.attributes.has(name);
  }

  removeAttribute(name) {
    this.attributes.delete(name);
    if (name === 'alt') this._alt = '';
    if (name === 'title') this._title = '';
  }

  get alt() {
    return this.getAttribute('alt') || '';
  }

  set alt(value) {
    this.setAttribute('alt', value);
  }

  get title() {
    return this.getAttribute('title') || '';
  }

  set title(value) {
    this.setAttribute('title', value);
  }

  get className() {
    return this.getAttribute('class') || '';
  }

  set className(value) {
    this.setAttribute('class', value);
  }

  querySelectorAll(selector) {
    if (!this.ownerDocument) return [];
    return this.ownerDocument._querySelectorAllFrom(this, selector);
  }

  querySelector(selector) {
    const all = this.querySelectorAll(selector);
    return all.length > 0 ? all[0] : null;
  }

  closest(selector) {
    const parsed = parseSelector(selector);
    if (!parsed || parsed.nameAttr) return null;
    let current = this;
    while (current && current.nodeType === 1) {
      if (current.tagName === parsed.tagName) return current;
      current = current.parentNode;
    }
    return null;
  }
}

class FakeDocument extends FakeNode {
  constructor() {
    super(9);
    this.ownerDocument = this;
    this.readyState = 'complete';
    this._listeners = new Map();

    this.documentElement = new FakeElement('html', this);
    this.body = new FakeElement('body', this);
    this.documentElement.appendChild(this.body);
  }

  createElement(tagName) {
    return new FakeElement(tagName, this);
  }

  addEventListener(type, listener, options = {}) {
    const entries = this._listeners.get(type) || [];
    entries.push({ listener, once: Boolean(options?.once) });
    this._listeners.set(type, entries);
  }

  dispatchEvent(type) {
    const entries = this._listeners.get(type);
    if (!entries || entries.length === 0) return;
    const keep = [];
    for (const entry of entries) {
      entry.listener();
      if (!entry.once) keep.push(entry);
    }
    this._listeners.set(type, keep);
  }

  querySelectorAll(selector) {
    return this._querySelectorAllFrom(this.documentElement, selector);
  }

  querySelector(selector) {
    const all = this.querySelectorAll(selector);
    return all.length > 0 ? all[0] : null;
  }

  _querySelectorAllFrom(root, selector) {
    const results = [];
    const visit = (node) => {
      if (!node || !node.childNodes) return;
      for (const child of node.childNodes) {
        if (child.nodeType !== 1) continue;
        if (matchesSelector(child, selector)) {
          results.push(child);
        }
        visit(child);
      }
    };
    visit(root);
    return results;
  }
}

export const createMockDocument = () => new FakeDocument();

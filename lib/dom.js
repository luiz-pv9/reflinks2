/**
 * Checks if the given Html snippet is valid or not. It's considered valid if
 * the browser keeps the same structure after transforming it into an
 * HTMLElement. For example:
 *
 * ```
 * dom.checkHtml('<div>Hello</div>'); # => true
 * dom.checkHtml('<div>Hello</span>'); # => false
 * ```
 *
 * @param {string} Html string 
 * @return {boolean} True if ok, false otherwise.
 */
export function checkHtml(htmlStr) {
  const div = document.createElement('div');
  div.innerHTML = htmlStr;
  return div.innerHTML === htmlStr;
}

/**
 * Parses the given Html string and transforms it into an HTMLElement. The given
 * Html snippet must have a single root node, such as '<div>...</div>'. If it
 * has multiple root nodes, such as '<div>...</div><div>...</div>' an error
 * will be thrown.
 * 
 * @param {string} htmlStr Html snippet
 * @return {HTMLElement} Parsed html snippet
 */
export function strToElm(htmlStr) {
  let elm;
  if(/<\/html>/.test(htmlStr)) {
    elm = document.createElement('html');
  } else {
    elm = document.createElement('div');
  }

  elm.innerHTML = htmlStr;

  if(elm.tagName === 'HTML') {
    return elm;
  }

  if(elm.childNodes.length > 1) {
    throw new Error(`HTML string contains multiple root nodes`);
  }

  const child = elm.childNodes && elm.childNodes[0];
  return child ? child.parentNode.removeChild(child) : null;
}

/**
 * Removes the given elm from the DOM tree. All events are kept in memory as
 * long as we have a variable reference to it.
 * 
 * @param {HTMLElement} elm Element to be removed
 * @return {boolean} True if the element was removed, false otherwise.
 */
export function remove(elm) {
  const wasRemoved = elm.parentNode && elm.parentNode.removeChild(elm);
  
  return !!wasRemoved;
}

/**
 * Triggers a custom event with the given name on the element. Check the attr
 * `defaultPrevent` to decide if the event is cancelable.
 * 
 * @param {HTMLElement} elm Element to trigger the event from
 * @param {string} eventName Name of the event
 * @param {object} customData Optional data of the event accessible in the `details` attr.
 * @return {boolean} False if the event was canceled, true if it should continue.
 */
export function emit(elm, eventName, customData = {}) {
  let event = new CustomEvent(eventName, {
    detail: customData,
    cancelable: true,
  });

  return elm.dispatchEvent(event);
}

/**
 * Removes the oldElm from the parent node and inserts the `newElm` in the
 * same position, simulating a "replace".
 *
 * @param {HTMLElement} oldElm Element to be removed
 * @param {HTMLElement} newElm Element to be added
 */
export function replaceWith(oldElm, newElm) {
  oldElm.parentNode.replaceChild(newElm, oldElm);
}
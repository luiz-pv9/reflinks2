import * as dom from '../lib/dom';

describe('dom.checkHtml', () => {
  it('returns true if the html is valid', () => {
    expect(dom.checkHtml('<div>Hello</div>')).toBe(true);
  });

  it('returns false if the html is invalid', () => {
    expect(dom.checkHtml('<div>Hello')).toBe(false);
    expect(dom.checkHtml('<div class="test>Hello</div>')).toBe(false);
    expect(dom.checkHtml('<div>Hello</span>')).toBe(false);
  });
});

describe('dom.strToElm', () => {
  it('throws an error if the html has multiple roots', () => {
    const call = () => dom.strToElm('<div></div><span></span>');

    expect(call).toThrow(/multiple root nodes/);
  });

  it('returns an object instance of HTMLElement', () => {
    const elm = dom.strToElm('<div>Hello</div>');

    expect(elm.tagName).toEqual('DIV');
    expect(elm.innerHTML).toEqual('Hello');
  });

  it('has no parent in the DOM structure', () => {
    const elm = dom.strToElm('<div>hello</div>');

    expect(elm.parentNode).toBe(null);
  });
});

describe('dom.remove', () => {
  it('does nothing if the element has no parent', () => {
    const div = dom.strToElm('<div>Hello</div>');
    
    expect(dom.remove(div)).toEqual(false);
  });

  it('removes the element from the parent', () => {
    const parent = dom.strToElm('<div><span>Hello</span></div>');
    const child = parent.querySelector('span');

    expect(dom.remove(child)).toEqual(true);
    expect(child.parentNode).toBe(null);
  });

  it('keeps the event handlers on the removed element', () => {
    const parent = dom.strToElm('<div><span>Hello</span></div>');
    const child = parent.querySelector('span');
    let clickCalled = false;

    child.addEventListener('click', () => clickCalled = true);

    dom.remove(child);

    child.click();

    expect(clickCalled).toBe(true);
  });
});

import { expect } from 'chai';
import * as dom from '../lib/dom';

describe('dom.checkHtml', () => {
  it('returns true if the html is valid', () => {
    expect(dom.checkHtml('<div>Hello</div>')).to.eq(true);
  });

  it('returns false if the html is invalid', () => {
    expect(dom.checkHtml('<div>Hello')).to.eq(false);
    expect(dom.checkHtml('<div class="test>Hello</div>')).to.eq(false);
    expect(dom.checkHtml('<div>Hello</span>')).to.eq(false);
  });
});

describe('dom.strToElm', () => {
  it('throws an error if the html has multiple roots', () => {
    const call = () => dom.strToElm('<div></div><span></span>');

    expect(call).to.throw(/multiple root nodes/);
  });

  it('returns an object instance of HTMLElement', () => {
    const elm = dom.strToElm('<div>Hello</div>');

    expect(elm.tagName).to.eql('DIV');
    expect(elm.innerHTML).to.eql('Hello');
  });

  it('has no parent in the DOM structure', () => {
    const elm = dom.strToElm('<div>hello</div>');

    expect(elm.parentNode).to.be.null;
  });
});

describe('dom.remove', () => {
  it('does nothing if the element has no parent', () => {
    const div = dom.strToElm('<div>Hello</div>');
    
    expect(dom.remove(div)).to.eq(false);
  });

  it('removes the element from the parent', () => {
    const parent = dom.strToElm('<div><span>Hello</span></div>');
    const child = parent.querySelector('span');

    expect(dom.remove(child)).to.eq(true);
    expect(child.parentNode).to.eq(null);
  });

  it('keeps the event handlers on the removed element', () => {
    const parent = dom.strToElm('<div><span>Hello</span></div>');
    const child = parent.querySelector('span');
    let clickCalled = false;

    child.addEventListener('click', () => clickCalled = true);

    dom.remove(child);

    child.click();

    expect(clickCalled).to.eq(true);
  });
});

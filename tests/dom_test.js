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

  it('parses a full HTML page', () => {
    const html = `
    <!DOCTYPE html>
    <html lang="pt">
      <head>
        <title>my title</title>
      </head>
      <body>
        <div id="my-div"></div>
      </body>
    </html>
    `;

    const elm = dom.strToElm(html);

    expect(elm.tagName).to.eq('HTML');
    expect(elm.querySelector('#my-div')).to.be.ok;
    expect(elm.querySelector('title')).to.be.ok;

    // Limitation: we cannot parse the HTML tag itself
    expect(elm.hasAttribute('lang')).to.eq(false);
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

describe('dom.emit', () => {
  it('emits an event on the element', () => {
    let called = false;
    let div = dom.strToElm('<div></div>');

    div.addEventListener('my-event', ev => called = true);

    dom.emit(div, "my-event");

    expect(called).to.eq(true);
  });

  it('cancels the event with preventDefault', () => {
    let called = false;
    let div = dom.strToElm('<div></div>');

    div.addEventListener('my-event', ev => {
      ev.preventDefault();
      called = true;
    });

    let cancelled = !dom.emit(div, "my-event");

    expect(cancelled).to.eq(true);
    expect(called).to.eq(true);
  });

  it('emits an event on document', () => {
    let called = false;
    let callback = ev => { called = true; };

    document.addEventListener('my-event', callback);

    dom.emit(document, 'my-event');
    expect(called).to.eq(true);

    document.removeEventListener('my-event', callback);
  });

  it('emits an event on window', () => {
    let called = false;
    let callback = ev => { called = true; };

    window.addEventListener('my-event', callback);

    dom.emit(window, 'my-event');
    expect(called).to.eq(true);

    window.removeEventListener('my-event', callback);
  });
});

describe('dom.replaceWith', () => {
  it('replaces the element with the new one', () => {
    let elm = dom.strToElm('<div><span></span></div>');
    let span = elm.querySelector('span');
    let newSpan = dom.strToElm('<span id="new-span"></span>');

    dom.replaceWith(span, newSpan);

    expect(span.parentNode).to.be.null;
    expect(elm.childNodes).to.have.length(1);
    expect(elm.childNodes[0].id).to.eq('new-span');
  });

  it('throws an error if the element to be replaced has no parent node', () => {
    let span = dom.strToElm('<span></span>');
    let newSpan = dom.strToElm('<span id="new-span"></span>');

    let fn = () => dom.replaceWith(span, newSpan);

    expect(fn).to.throw();
  });
});
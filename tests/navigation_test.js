import { expect } from 'chai';
import sinon from 'sinon';
import { useFakeHistory, restoreFakeHistory } from './mocks/fake_history';
import * as navigation from '../lib/navigation';
import * as dom from '../lib/dom';
import config from '../lib/config';

describe('navigation.shouldTriggerVisit', () => {
  it('returns true if elm hasnt data-reflinks attr', () => {
    const elm = dom.strToElm('<a href="/"></a>');
    const shouldTrigger = navigation.shouldTriggerVisit(elm);
    expect(shouldTrigger).to.eq(true);
  });

  it('returns true if elm has data-reflinks="true"', () => {
    const elm = dom.strToElm('<a href="/" data-reflinks="true"></a>');
    const shouldTrigger = navigation.shouldTriggerVisit(elm);
    expect(shouldTrigger).to.eq(true);
  });

  it('returns false if elm has data-reflinks="false"', () => {
    const elm = dom.strToElm('<a href="/" data-reflinks="false"></a>');
    const shouldTrigger = navigation.shouldTriggerVisit(elm);
    expect(shouldTrigger).to.eq(false);
  });

  it('returns false if a parent has data-reflinks="false"', () => {
    const parent = dom.strToElm('<div data-reflinks="false"><a href="/"></a></div>');
    const elm = parent.querySelector('a');
    const shouldTrigger = navigation.shouldTriggerVisit(elm);
    expect(shouldTrigger).to.eq(false);
  });
});

describe('navigation.visit', () => {
  let xhr, requests;

  beforeEach(() => {
    useFakeHistory();
    xhr = sinon.useFakeXMLHttpRequest();
    requests = [];
    xhr.onCreate = xhr => requests.push(xhr);
  });

  afterEach(() => {
    config.rootSelector = 'body';
    restoreFakeHistory();
    xhr.restore();
  });

  it('pushes a new entry to the browser history on visit', () => {
    expect(window.fakeHistory.length).to.eq(0);

    // Sends a request using AJAX to /some-path. The promise is returned from
    // the test so mocha waits until it resolves or rejects.
    let promise = navigation.visit('/some-path').then(() => {
      expect(window.fakeHistory.length).to.eq(1);
      expect(window.fakeHistory.latest().path).to.eq('/some-path');
    });

    // Reponds the request sent to the fake server, which triggers the promise
    // `resolve` action.
    requests[0].respond(200, {}, '<html><body></body></html>');

    return promise;
  });

  it('emits before-visit', () => {
    let called = false;

    // Callback called when 'reflinks:before-cache' is triggered.
    let callback = ev => {
      called = true;
      expect(ev.detail.path).to.eq('/some-path');
      document.removeEventListener('reflinks:before-visit', callback);
    };

    // Binds the callback to 'reflinks:before-visit'
    document.addEventListener('reflinks:before-visit', callback);

    // We don't need to return the promise because the event 'before-visit' is
    // triggered before the request is sent to the server
    navigation.visit('/some-path');

    expect(called).to.eq(true);
  });

  it('emits before-cache', () => {
    let called = false;

    // Callback called when 'reflinks:before-cache' is triggered.
    let callback = ev => {
      called = true;
      expect(ev.detail.xhr).to.be.ok;
      expect(ev.detail.root).to.be.ok;
      expect(ev.detail.xhr.url).to.eq('/some-path');
      expect(ev.detail.xhr.status).to.eq(200);
      document.removeEventListener('reflinks:before-cache', callback);
    };

    // Binds the callback to 'reflinks:before-cache'
    document.addEventListener('reflinks:before-cache', callback);

    // Sends a request using AJAX to /some-path. The promise is returned from
    // the test so mocha waits until it resolves or rejects.
    let promise = navigation.visit('/some-path').then(res => {
      expect(called).to.eq(true);
    });

    // Reponds the request sent to the fake server, which triggers the promise
    // `resolve` action.
    requests[0].respond(200, {}, '<html><body></body></html>');

    return promise;
  });

  it('emits before-render', () => {
    let called = false;

    // Callback called when 'reflinks:before-render' is triggered.
    let callback = ev => {
      called = true;
      expect(ev.detail.newRoot).to.be.ok;
      expect(ev.detail.newRoot.id).to.eql('new-root');
      document.removeEventListener('reflinks:before-render', callback);
    };

    // Binds the callback to the event 'reflinks:before-render'
    document.addEventListener('reflinks:before-render', callback);

    // We need the promise returned from visit to return it from the test
    // function. Mocha automatically waits for the promise to be resolved or 
    // rejected.
    let promise = navigation.visit('/some-path').then(res => {
      expect(called).to.eq(true);
    });

    // Reponds the request sent to the fake server, which triggers the promise
    // `resolve` action.
    requests[0].respond(200, {}, '<html><body id="new-root"></body></html>');

    return promise;
  });

  it('emits render', () => {
    let called = false;

    // Callback to be called when 'reflinks:render' is triggered
    let callback = ev => {
      called = true;
      document.removeEventListener('reflinks:render', callback);
      expect(ev.detail.root.id).to.eq('new-root');
    };

    // Binds the callback to the event 'reflinks:render'
    document.addEventListener('reflinks:render', callback);

    // We need the promise returned from the visit so that mocha waits until
    // it is resolved or rejected.
    let promise = navigation.visit('/some-path').then(res => {
      expect(called).to.eq(true);
    });

    // Reponds the request sent to the fake server (sinon)
    requests[0].respond(200, {}, '<html><body id="new-root"></body></html>');

    return promise;
  });

  it('throws an error if the response did not contain a root', (done) => {
    // The root element must have an id of 'something'
    config.rootSelector = '#something-else';

    // The visit fails because no root element was found in the response
    navigation.visit('/some-path').catch(err => {
      console.log(err);
      expect(err).to.match(/root element/);
      done();
    });

    // The response from the server did not contian an element with '#something'
    requests[0].respond(200, {}, '<html><body></body></html>');
  });

  it('cancels the visit if preventDefault is called on before-visit', (done) => {
    // Callback called when 'reflinks:before-visit' is triggered. Calling
    // `preventDefault` stops the visit and the promise is rejected.
    let callback = ev => {
      ev.preventDefault();
      document.removeEventListener('reflinks:before-visit', callback);
    };

    document.addEventListener('reflinks:before-visit', callback);

    // If the visit was canceled the promise is rejected.
    navigation.visit('/some-path').catch(err => {
      expect(err).to.match(/visit canceled/i);
      done();
    });
  });

  it('replaces the current root with the new root', () => {
    config.rootSelector = '#my-root';

    // Manually insert the root on the page
    let root = dom.strToElm('<div id="my-root">old</div>');
    document.body.appendChild(root);

    let promise = navigation.visit('/some-path').then(res => {
      let currentRoot = document.querySelector('#my-root');
      expect(currentRoot.innerHTML).to.eq('new');
    });

    requests[0].respond(200, {}, '<html><body><div id="my-root">new</div></body></html>');

    return promise;
  });

  it('merges metatags', () => {
    let meta = dom.strToElm('<meta name="existing-meta" content="old-value">');
    document.head.appendChild(meta);

    let promise = navigation.visit('/some-path').then(res => {
      // Inserts new meta tags
      let newMeta = document.querySelector('meta[name="new-meta"]');
      expect(newMeta.content).to.eq('new-value');

      // Overrides existing meta tags
      let oldMeta = document.querySelector('meta[name="existing-meta"]');
      expect(oldMeta.content).to.eq('new-value');
    });

    requests[0].respond(200, {}, `
      <html>
        <head>
          <meta name="new-meta" content="new-value">
          <meta name="existing-meta" content="new-value">
        </head>
        <body>
        </body>
      </html>
    `);

    return promise;
  });

  it('updates the document title', () => {
    expect(document.title).not.to.eq('new-title');

    let promise = navigation.visit('/some-path').then(res => {
      expect(document.title).to.eq('new-title');
    });

    requests[0].respond(200, {}, `
      <html>
        <head>
          <title>new-title</title>
        </head>
        <body>
        </body>
      </html>
    `);

    return promise;
  });
});

describe('components', () => {
  let xhr, requests;

  beforeEach(() => {
    useFakeHistory();
    xhr = sinon.useFakeXMLHttpRequest();
    requests = [];
    xhr.onCreate = xhr => requests.push(xhr);
  });

  afterEach(() => {
    config.rootSelector = 'body';
    restoreFakeHistory();
    xhr.restore();
  });

  it('keeps permanent elements on page change', () => {
    let elm = dom.strToElm('<div id="p-elm" data-reflinks="permanent">hello</div>');
    document.body.appendChild(elm);

    let promise = navigation.visit('/some-path').then(res => {
      let permanent = document.querySelector('#p-elm');
      expect(permanent.innerHTML).to.eq('hello');
    });

    requests[0].respond(200, {}, `
      <html>
        <body>
          <div id="p-elm" data-reflinks="permanent"></div>
        </body>
      </html>
    `);

    return promise;
  });

  // Visiting a page that has the element, then a page that hasn't, then a page
  // that has it again.
  it('keeps permanent elements pages that skips it', () => {
    let elm = dom.strToElm('<div id="p-elm" data-reflinks="permanent">hello</div>');
    document.body.appendChild(elm);

    let promise = navigation.visit('/some-path').then(res => {
      let permanent = document.querySelector('#p-elm');
      expect(permanent.innerHTML).to.eq('hello');
    });

    requests[0].respond(200, {}, `
      <html>
        <body>
          <div id="p-elm" data-reflinks="permanent"></div>
        </body>
      </html>
    `);

    return promise;
  });

  it('attaches new components');
  it('detaches old components');
});

describe('popstate', () => {
  it('sends a request if the page is not cached');
  it('restores from cache if the page is cached');
  it('doesnt initialize components');
  it('doesnt trigger render');
});


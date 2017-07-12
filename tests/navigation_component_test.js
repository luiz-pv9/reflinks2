import { expect } from 'chai';
import sinon from 'sinon';
import { useFakeHistory, restoreFakeHistory } from './mocks/fake_history';
import * as navigation from '../lib/navigation';
import * as dom from '../lib/dom';
import * as component from '../lib/component';
import config from '../lib/config';

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
    component.clear();
  });

  it('keeps permanent elements on page change', () => {
    let elm = dom.strToElm('<div id="p-elm" data-reflinks="permanent">hello</div>');
    document.body.appendChild(elm);

    let promise = navigation.visit('/some-path').then(res => {
      let permanent = document.querySelector('#p-elm');
      expect(permanent.innerHTML).to.eq('hello');
      expect(navigation.getPermanentElementsIds()).to.eql(['p-elm']);
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

  it('clear permanent elements if the new page doesnt have it', () => {
    let elm = dom.strToElm('<div id="p-elm" data-reflinks="permanent">hello</div>');
    document.body.appendChild(elm);

    let promise = navigation.visit('/some-path').then(res => {
      expect(navigation.getPermanentElementsIds()).to.eql([]);
    });

    requests[0].respond(200, {}, `
      <html>
        <body>
          <div>no permanent element in this page</div>
        </body>
      </html>
    `);

    return promise;
  });

  it('attaches new components', () => {
    let called = false;
    component.register('my-component', {
      attached() { called = true; }
    });

    let promise = navigation.visit('/some-path').then(res => {
      expect(called).to.eq(true);
    });

    requests[0].respond(200, {}, `
      <html>
        <body>
          <my-component>hello</my-component>
        </body>
      </html>
    `);

    return promise;
  });

  it('detaches old components', () => {
    let called = false;

    // Component definition
    component.register('my-component', {
      attached() { },
      detached() { called = true; }
    });

    // Manually initialize the component
    let elm = dom.strToElm('<my-component></my-component>');
    document.body.appendChild(elm);
    component.attach(document.body);

    let promise = navigation.visit('/some-path').then(res => {
      expect(called).to.eq(true);
    });

    requests[0].respond(200, {}, `
      <html>
        <body>
          <h1>new body here :)</h1>
        </body>
      </html>
    `);

    return promise;
  });

  it('doesnt call attached a second time on permanent components when page changes');
  it('doesnt call detached when a permanent component is moved to another page');
  it('calls detached when a permanent component is not present on the next page');
});

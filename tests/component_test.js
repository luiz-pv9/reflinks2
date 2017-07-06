import { exepct } from 'chai';
import * as component from '../lib/component';
import * as dom from '../lib/dom';

describe('component.*', () => {
  beforeEach(() => {
    component.clear();
  });

  it('throws an error if there are multiple components with the same name', () => {
    const fn = () => component.register('my-component', {});

    expect(fn).not.to.throw(/already registered/); // first time
    expect(fn).to.throw(/already registered/); // second time
  });

  it('throws an error if the component has an invalid name', () => {
    const fns = [
      () => component.register('my&component', {}),
      () => component.register('MY-COMPONENT', {}),
      () => component.register('9-my-compoennt', {})
    ];

    fns.forEach(fn => {
      expect(fn).to.throw(/invalid name/);
    });
  });

  it('calls `attached` when the component is initialized', () => {
    const div = dom.strToElm('<div><timer></timer></div>');
    let initialized = false;

    component.register('timer', {
      attached() { initialized = true; }
    });

    component.attach(div);

    expect(initialized).to.eq(true);
  });

  it('calls `attached` only once', () => {
    const div = dom.strToElm('<div><timer></timer></div>');
    let count = 0;

    component.register('timer', {
      attached() { count += 1; }
    });

    component.attach(div);
    component.attach(div);

    expect(count).to.eql(1);
  });

  it('calls `detached` on all child components', () => {
    const div = dom.strToElm('<div><timer></timer></div>');
    let called = false;

    component.register('timer', {
      attached() {},
      detached() { called = true; }
    });

    component.attach(div);
    component.detach(div);

    expect(called).to.eq(true);
  });
});

import * as component from '../lib/component';
import * as dom from '../lib/dom';

describe('component.*', () => {
  beforeEach(() => {
    component.clear();
  });

  it('throws an error if there are multiple components with the same name', () => {
    const fn = () => component.register('my-component', {});

    expect(fn).not.toThrow(/already registered/); // first time
    expect(fn).toThrow(/already registered/); // second time
  });

  it('throws an error if the component has an invalid name', () => {
    const fns = [
      () => component.register('my&component', {}),
      () => component.register('MY-COMPONENT', {}),
      () => component.register('9-my-compoennt', {})
    ];

    fns.forEach(fn => {
      expect(fn).toThrow(/invalid name/);
    });
  });

  it('calls `attached` when the component is initialized', () => {
    const div = dom.strToElm('<div><timer></timer></div>');
    let initialized = false;

    component.register('timer', {
      attached() { initialized = true; }
    });

    component.attach(div);

    expect(initialized).toBe(true);
  });

  it('calls `attached` only once', () => {
    const div = dom.strToElm('<div><timer></timer></div>');
    let count = 0;

    component.register('timer', {
      attached() { count += 1; }
    });

    component.attach(div);
    component.attach(div);

    expect(count).toEqual(1);
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

    expect(called).toBe(true);
  });
});

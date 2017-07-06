import * as component from '../lib/component';
import * as dom from '../lib/dom';

describe('component module', () => {
  it('throws an error if there are multiple components with the same name', () => {
    const fn = () => component.register('my-component', {});

    expect(fn).not.toThrow(/already registered/); // first time
    expect(fn).toThrow(/already registered/); // second time
  });

  // lower case, dash in the middle
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
      attached(elm) { initialized = true; }
    });

    component.initialize(div);

    expect(initialized).toBe(true);
  });

  it('calls `attached` only once');
});

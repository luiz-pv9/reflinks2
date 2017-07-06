import request from '../lib/request';

describe('request', () => {
  it('GET', () => {
    return request('get', 'http://httpbin.org/get?msg=Hello').then(res => {
      expect(res.xhr.status).toBe(200);
      // expect(res.data.params).toEqual({ msg: 'Hello' });
    });
  });

  it('POST');
  it('parses JSON');
  it('evals Javascript');
});
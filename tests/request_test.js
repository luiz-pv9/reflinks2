import { expect } from 'chai';
import sinon from 'sinon';
import request from '../lib/request';

describe('request', () => {
  let xhr, requests;

  beforeEach(() => {
    xhr = sinon.useFakeXMLHttpRequest();
    requests = [];
    xhr.onCreate = xhr => requests.push(xhr);
  });

  afterEach(() => {
    xhr.restore();
  });

  it('sends a GET request', () => {
    let promise = request('get', '/some-path').then(res => {
      expect(res.xhr.status).to.eq(200);
    });

    expect(requests[0].method).to.eq('get');
    expect(requests[0].url).to.eq('/some-path');
    requests[0].respond(200, {}, 'ok');

    return promise;
  });

  it('sends a POST request', () => {
    let promise = request('post', '/some-path').then(res => {
      expect(res.xhr.status).to.eq(200);
    });

    expect(requests[0].method).to.eq('post');
    expect(requests[0].url).to.eq('/some-path');
    requests[0].respond(200, {}, 'ok');

    return promise;
  });

  it('parses JSON resposen', () => {
    let promise = request('post', '/some-path').then(res => {
      expect(res.xhr.status).to.eq(200);
      expect(res.data).to.eql({msg: 'hello'});
    });

    expect(requests[0].method).to.eq('post');
    expect(requests[0].url).to.eq('/some-path');
    requests[0].respond(
      200, 
      {'content-type': 'application/json'},
      '{"msg": "hello"}'
    );

    return promise;
  });

  it('evals Javascript response', () => {
    let promise = request('post', '/some-path').then(res => {
      expect(res.xhr.status).to.eq(200);
      expect(res.data).to.eql([1,2,3]);
    });

    expect(requests[0].method).to.eq('post');
    expect(requests[0].url).to.eq('/some-path');
    requests[0].respond(
      200, 
      {'content-type': 'application/javascript'},
      '(function() { return [1,2,3]; })()'
    );

    return promise;
  });
});
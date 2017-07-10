/**
 * Parses the response from the given xhr object. The returned object is
 * argument to resolve or reject in the request promise.
 *
 * @param {XMLHttpRequest} xhr Ajax request
 * @return {object} Parsed response
 */
function parseResponse(xhr) {
  let data = xhr.responseText;
  const contentType = xhr.getResponseHeader('content-type') || '';

  if(contentType.indexOf('json') !== -1) {
    data = JSON.parse(data);
  } else if(contentType.indexOf('javascript') !== -1) {
    data = eval(data);
  }

  return { xhr, data };
}

/**
 * Sends an AJAX request and parses the response value. Example:
 *
 * ```
 * request('get', '/my-path').then(res => {
 *   console.log(res.data);
 * }).catch(res => {
 *   console.log(res.xhr.status);
 * });
 * ```
 *
 * @param {string} method Http method such as 'get' or 'post'
 * @param {string} url Url to send the request. It doens't have to include the domain 
 * @param {object} opts Request options. See examples to see properties.
 */
export default function(method, url, opts = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
      if(xhr.readyState === 4) {
        let parsedResponse = parseResponse(xhr);
        if(xhr.status >= 200 && xhr.status < 300) {
          resolve(parsedResponse);
        } else {
          reject(parsedResponse);
        }
      }
    };

    xhr.open(method, url, true);
    xhr.setRequestHeader('x-reflinks', 'true');
    xhr.setRequestHeader('x-requested-with', 'XMLHttpRequest');

    if(typeof opts.data === 'object' && !(opts.data instanceof FormData)) {
      xhr.setRequestHeader('content-type', 'application/json');
    }

    xhr.send(opts.data);
  });
}
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
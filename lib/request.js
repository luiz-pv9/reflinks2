function parseResponse(xhr) {
  const data = xhr.responseText;
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
    // xhr.setRequestHeader('x-requested-with', 'XMLHttpRequest');
    xhr.send(opts.data);
  });
}
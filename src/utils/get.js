// accepts a url and returns a promise
const get = url =>
  new Promise((resolve, reject) => {
    const req = new XMLHttpRequest(); // eslint-disable-line
    req.open('GET', url);

    req.onload = function () {
      if (req.status === 200) {
        resolve(req.response);
      } else {
        reject(Error(req.statusText));
      }
    };

    req.onerror = function () {
      reject(Error('Sorry something went wrong.'));
    };

    req.send();
  });

module.exports = get;

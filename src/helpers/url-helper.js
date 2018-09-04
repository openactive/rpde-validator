import fetch from 'node-fetch';
import { URL } from 'url';

import TimeoutError from '../errors/timeout-error';

class UrlHelper {
  static deriveUrl(url, base) {
    if (typeof url !== 'string') {
      return '';
    }
    let urlRaw = url;
    if (!urlRaw.match(/^http/)) {
      if (urlRaw.match(/^\//)) {
        const currentUrl = new URL(base);
        urlRaw = `${currentUrl.origin}${urlRaw}`;
      }
    }
    return urlRaw;
  }

  static getParam(param, url, base) {
    const derivedUrl = this.deriveUrl(url, base);
    let urlObj;
    try {
      urlObj = new URL(derivedUrl);
    } catch (e) {
      return null;
    }
    return urlObj.searchParams.get(param);
  }

  static findParamInWrongCase(param, url, base) {
    const derivedUrl = this.deriveUrl(url, base);
    let urlObj;
    try {
      urlObj = new URL(derivedUrl);
    } catch (e) {
      return null;
    }
    for (const i of urlObj.searchParams.keys()) {
      if (i !== param && i.toLowerCase() === param.toLowerCase()) {
        return i;
      }
    }
    return null;
  }

  static fetch(url, options = {}, timeout = 10000) {
    let timeoutId;
    return Promise.race([
      fetch(url, options).then(
        (res) => {
          clearTimeout(timeoutId);
          return res;
        },
      ),
      new Promise((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new TimeoutError(`Request to ${url} timed out after ${timeout}ms`)),
          timeout,
        );
      }),
    ]);
  }

  static isUrl(url) {
    if (typeof url !== 'string') {
      return false;
    }
    return UrlHelper.URL_REGEX.test(url);
  }
}

// Source: https://gist.github.com/dperini/729294
UrlHelper.URL_REGEX = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;

export default UrlHelper;

import * as dom from './dom';
import config from './config';
import * as component from './component';
import request from './request';

const sessionPagesCache = {};
const permanentElementsById = {};

/**
 * `fakeHistory` is defined in tests only. It has (kind of) the same API of
 * history.
 */
const history = () => window.fakeHistory || window.history;

/**
 * Default argument for the `visit` function.
 */
const defaultVisitOptions = {
  action: 'advance'
};

/**
 * Caches permanent elements from the current page if they're not already in
 * the cache, and saves the document root in the pages cache.
 */
document.addEventListener('reflinks:before-render', ev => {
  if(ev.detail.root) {
    component.detach(ev.detail.root);
  }
});

/**
 * Places permanent elements in from the cache to the current page and triggers
 * component initialization.
 */
document.addEventListener('reflinks:render', ev => {
  if(ev.detail.root) {
    component.attach(ev.detail.root);
  }
});

function cachePage(url, rootElement) {
}

/**
 * Returns the ids all cached permanent elements. This function is used only
 * in tests.
 *
 * @return {string[]} Array of the permanent elements ids
 */
export function getPermanentElementsIds() {
  return Object.keys(permanentElementsById);
}

/**
 * Stores the permanents elements in the given.
 *
 * @param {HTMLElement} elm Element to store permanents elements from.
 */
function cachePermanentElements(elm) {
  if(!elm || !elm.querySelectorAll) return;

  let permanents = elm.querySelectorAll('[data-reflinks="permanent"]');
  permanents.forEach(permanent => {
    if(!permanent.id) {
      console.error(permanent);
      throw new Error(`Permanent element must have id`);
    }

    let placeholder = permanent.cloneNode(false);
    dom.replaceWith(permanent, placeholder);
    permanentElementsById[permanent.id] = permanent;
  });
}

/**
 * Restore permanent elements in the cache to the elements
 * 
 * @param {HTMLElement}
 */
function restorePermanentElementsAndRemoveStale(elm) {
  Object.keys(permanentElementsById).forEach(id => {
    let elm = document.getElementById(id);
    if(elm && elm.getAttribute('data-reflinks') === 'permanent') {
      dom.replaceWith(elm, permanentElementsById[id]);
    } else {
      delete permanentElementsById[id];
    }
  });
};

/**
 * Inserts the <meta> tags from the given page. New meta tags are inserted,
 * conflicting metatags (with the same name) are updated to the new value.
 * 
 * @param {HTMLElement} newPage Page to extract meta tags from
 */
function mergeMetaTags(newPage) {
  let metas = newPage.querySelectorAll('meta');
  metas.forEach(meta => {
    let metaOnPage = document.querySelector(`meta[name="${meta.name}"]`);

    if(metaOnPage) {
      dom.replaceWith(metaOnPage, meta);
    } else {
      document.head.appendChild(meta);
    }
  });
}

/**
 * Updates the page title with the value from the <title> tag in the given
 * page. If the element has no title, the current one is kept.
 * 
 * @param {HTMLElement} newPage Page to grab title from
 */
function updatePageTitle(newPage) {
  let title = newPage.querySelector('title');
  if(title) {
    document.title = title.innerHTML;
  }
}

/**
 * Finds the root element on the current page using the selector defined
 * in the config.
 *
 * @return {HTMLElement} Root element (that changes from page to page)
 */
function rootElement(root = document) {
  return root.querySelector(config.rootSelector);
}

/**
 * Adds a click listener to the given root element that bubbles up from all
 * elements clicked inside it. We use this event bind to check for clicks
 * on anchor links that triggers a visit from Reflinks.
 */
export function addClickListener(root) {
  root.addEventListener('click', function(ev) {
  }, true);
}

/**
 * Checks if the given elm should trigger a visit. All anchor elements trigger
 * a visit by default. To change this behaviour use `data-reflinks` to disable
 * or enable it.
 * 
 * @param {HTMLElement} elm Element to check if it should trigger a visit.
 */
export function shouldTriggerVisit(elm) {
  while(elm) {
    if(elm.getAttribute('data-reflinks') === 'true') {
      return true;
    }

    if(elm.getAttribute('data-reflinks') === 'false') {
      return false;
    }

    elm = elm.parentNode;
  }

  return true;
}

/**
 * Performs a visit to the given path. Triggers all events in the process.
 *
 * @param {string} path Path to visit
 * @param {object} options Options to the visit.
 */
export function visit(path, options = defaultVisitOptions) {
  let canceled = !dom.emit(document, 'reflinks:before-visit', {path});

  if(canceled) {
    return Promise.reject('Visit canceled');
  }

  return request('get', path).then(res => {

    // Trigget 'before-cache' with the current root. The user is able to
    // modify it before we cache it.
    let currentRoot = rootElement(document);
    dom.emit(document, 'reflinks:before-cache', {
      xhr: res.xhr,
      root: currentRoot
    });

    // Caches the current page associated with the request url.
    cachePage(res.xhr.url, currentRoot);
    cachePermanentElements(currentRoot);

    // Grab the new root element from the server response. If we can not find
    // the root element an error is thrown.
    let newPage = dom.strToElm(res.data);
    let newRoot = rootElement(newPage);
    if(!newRoot) {
      throw new Error(`Could not find root element in the response. Root selector: ${config.rootSelector}`);
    }

    // Trigger 'before-render' with the new root
    dom.emit(document, 'reflinks:before-render', { root: currentRoot, newRoot });

    // Update page title
    updatePageTitle(newPage);

    // Merge meta tags
    mergeMetaTags(newPage);

    // Update root element
    dom.replaceWith(currentRoot, newRoot);

    restorePermanentElementsAndRemoveStale(newRoot);

    dom.emit(document, 'reflinks:render', { root: newRoot });

    history().pushState({reflinks: true}, path, path);
  });
}
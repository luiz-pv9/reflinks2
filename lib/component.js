const components = [];

/**
 * Checks if the component name is valid. Valid names must start with a lower
 * case character, followed by digits and dash (-).
 *
 * @param {string} componentName Name of the component
 * @return {boolean} True if it is valid, false otherwise.
 */
function isNameValid(componentName)  {
  const regex = /^[a-z]{1}[a-z0-9\-]*[a-z0-9]{1}$/;
  return regex.test(componentName);
}

/**
 * Registers the component in the compiler. The component will then be used in
 * the calls to `initialize`. The components are registered globally. I think
 * there is no need to scope them and initialize from different scopes... maybe?
 *
 * @param {string} componentName Unique name of the component.
 * @param {object} opts Configuration of the component life cycle
 */
export function register(componentName, opts) {
  const alreadyRegistered = components.find(component => component.name === componentName);
  if(alreadyRegistered) {
    throw new Error(`Component [${componentName}] already registered. Maybe choose a different name?`);
  }

  if(!isNameValid(componentName)) {
    throw new Error(`Component [${componentName}] has an invalid name. Please use lower case characters, numbers and dash`);
  }

  opts.name = componentName;
  opts.selector = `${componentName},[data-component="${componentName}"]`;

  components.push(opts);
}

/**
 * Initializes all components declared inside the given node. Let's say we
 * defined the following component `timer`.
 * 
 * ```
 * Reflinks.registerComponent('timer', { ... });
 * ```
 * 
 * The component is then identified by either of the following forms (both works):
 *
 * ```
 * <div data-component="timer">00:10</div>
 * <timer>00:10</timer>
 * ```
 *
 * @param {HTMLElement} root Element to initialize the components from.
 */
export function initialize(root) {
  components.forEach(componentDef => {
    const componentsInRoot = root.querySelectorAll(componentDef.selector);

    componentsInRoot.forEach(component => {
      if(typeof componentDef.attached === 'function') {
        componentDef.attached(component);
      }
    });
  });
}
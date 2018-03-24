import { h } from 'hyperapp';

let store;

const clone = (data) => {
  if (Array.isArray(data)) return [...data];
  if (typeof data === 'object') return { ...data };
  return data;
};

const setValueForPath = (path, value, data) => {
  if (!path.length) return data;

  const newData = clone(data);
  const key = path[0];

  newData[key] = path.length > 1 ? setValueForPath(path.slice(1), value, data[key]) : value;

  return newData;
};

const createStore = (initialState = {}, actions) => {
  let state = initialState;

  return {
    getState: () => state,
    setState: (namespace, newState) => {
      const path = namespace.split('.');
      state = setValueForPath(path, newState, state);
    },

    getActions: () => actions,
  };
};

const enhanceActions = (actionsTemplate = {}, namespace = '') =>
  Object.entries(actionsTemplate).reduce((enhancedActions, [name, action]) => ({
    ...enhancedActions,
    [name]: typeof action === 'function'
      ? (...args) => (state, actions) => {
        let result = action(...args);
        result = typeof result === 'function'
          ? result(state, actions)
          : result;

        if (result) store.setState(namespace, result);

        return result;
      }
      : enhanceActions(action, (namespace && `${namespace}.`) + name),
  }), {});

export const withStore = (app) => (initialState, actionsTemplate, view, container) => {
  const enhancedActions = enhanceActions(actionsTemplate);
  const appActions = app(initialState, enhancedActions, view, container);

  store = createStore(initialState, appActions);

  return appActions;
};

export const Connect = (mapStateToProps, mapActionsToProps) => (WrappedComponent) => (props) => {
  const propsMap = mapStateToProps(store.getState(), props);
  const actionsMap = mapActionsToProps(store.getActions(), props);

  return (
    // eslint-disable-next-line react/jsx-filename-extension
    <WrappedComponent {...props} {...propsMap} {...actionsMap} />
  );
};

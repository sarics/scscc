export const addListener = (listeners, cb) => {
  const newListeners = listeners.slice();
  if (newListeners.indexOf(cb) === -1) newListeners.push(cb);
  return newListeners;
};

export const removeListener = (listeners, cb) => {
  if (cb) {
    const newListeners = listeners.slice();
    const cbInd = newListeners.indexOf(cb);
    if (cbInd !== -1) newListeners.splice(cbInd, 1);
    return newListeners;
  }
  return [];
};

export const callListeners = (listeners, ...args) => listeners.forEach((cb) => cb(...args));

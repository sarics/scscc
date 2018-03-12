import { app } from 'hyperapp';

import actions from './actions';
import App from './App';

Promise.all([browser.runtime.getBackgroundPage(), browser.storage.local.get('preferences')])
  .then(([bgWindow, storage]) => {
    const state = {
      options: bgWindow.OPTIONS,
      preferences: storage.preferences,
    };

    const main = app(state, actions, App, document.getElementById('app'));

    browser.storage.onChanged.addListener(({ preferences }) => {
      if (preferences) main.preferences.set(preferences.newValue);
    });
  });

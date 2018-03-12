import { app } from 'hyperapp';

import { withStore } from './store';

import actions from './actions';
import App from './App';

Promise.all([browser.runtime.getBackgroundPage(), browser.storage.local.get('preferences')])
  .then(([bgWindow, storage]) => {
    const initialState = {
      options: bgWindow.OPTIONS,
      preferences: storage.preferences,
    };

    const main = withStore(app)(initialState, actions, App, document.getElementById('app'));

    browser.storage.onChanged.addListener(({ preferences }) => {
      if (preferences) main.preferences.set(preferences.newValue);
    });
  });

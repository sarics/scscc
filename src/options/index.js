import { app } from 'hyperapp';

import actions from './actions';
import App from './App';

import './icons';
import './options.scss';

Promise.all([browser.runtime.getBackgroundPage(), browser.storage.local.get('preferences')])
  .then(([bgWindow, storage]) => {
    const initialState = {
      options: bgWindow.OPTIONS,
      preferences: storage.preferences,
    };

    const main = app(initialState, actions, App, document.getElementById('app'));

    browser.storage.onChanged.addListener(({ preferences }) => {
      if (preferences) main.preferences.set(preferences.newValue);
    });
  });

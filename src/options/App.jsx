import { h } from 'hyperapp';

import OptionsContainer from './components/OptionsContainer';

const App = () => (
  <div>
    <section class="hero is-info">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">Options</h1>
          <h2 class="subtitle">SCs Currency Converter</h2>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <OptionsContainer />
      </div>
    </section>
  </div>
);

export default App;

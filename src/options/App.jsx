import { h } from 'hyperapp';

import OptionsContainer from './components/OptionsContainer';

const App = ({ options, preferences }, { preferences: { handleChange } }) => (
  <div class="container">
    <h1>SCs Currency Converter - Options</h1>

    <OptionsContainer options={options} preferences={preferences} onOptionChange={handleChange} />
  </div>
);

export default App;

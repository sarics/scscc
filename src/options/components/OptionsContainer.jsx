import { h } from 'hyperapp';

import OptionField from './OptionField';
import ResetButton from './ResetButton';

const OptionsContainer = ({ options, preferences, onOptionChange }) => (
  <div class="options">
    {options.map(({
      name,
      title,
      type,
      options: opts,
    }) => (
      <div key={name} class="row">
        <div class="col">
          <label for={`option-${name}`}>{title}</label>
        </div>

        <div class="col">
          <OptionField id={`option-${name}`} type={type} name={name} value={preferences[name]} options={opts} onChange={onOptionChange} />
        </div>
      </div>
    ))}

    <div class="row">
      <div class="col" />

      <div class="col">
        <ResetButton />
      </div>
    </div>
  </div>
);

export default OptionsContainer;

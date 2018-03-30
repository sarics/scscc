import { h } from 'hyperapp';

import OptionField from './OptionField';
import ResetButton from './ResetButton';

const OptionsContainer = () => ({ options, preferences }, { preferences: { handleChange } }) => (
  <div class="container">
    {options.map(({
      name,
      title,
      type,
      options: opts,
    }) => (
      <div key={name} class="field is-horizontal">
        <div class={['field-label', ['text', 'select'].indexOf(type) > -1 && 'is-normal'].filter(Boolean).join(' ')}>
          <label for={`option-${name}`} class="label">{title}</label>
        </div>

        <div className="field-body">
          <div class="field">
            <div className="control">
              <OptionField id={`option-${name}`} type={type} name={name} value={preferences[name]} options={opts} onChange={handleChange} />
            </div>
          </div>
        </div>
      </div>
    ))}

    <div class="field is-horizontal">
      <div class="field-label" />

      <div class="field-body">
        <div className="field">
          <div className="control">
            <ResetButton />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default OptionsContainer;

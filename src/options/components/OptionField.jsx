import { h } from 'hyperapp';

const OptionField = ({
  id,
  name,
  type,
  value,
  options,
  onChange,
}) => {
  const handleChange = (e) => {
    e.preventDefault();

    const { target } = e;
    const newValue = type === 'checkbox' ? target.checked : target.value;

    onChange({ type, name, value: newValue });
  };

  switch (type) {
    case 'select':
      return (
        <div className="select is-fullwidth">
          <select id={id} name={name} value={value} onchange={handleChange}>
            {options.map(({ value: val, label }) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
      );
    case 'text':
      return (
        <input type="text" id={id} class="input" name={name} value={value} onchange={handleChange} />
      );
    case 'checkbox':
      return (
        <label class="checkbox">
          <input type="checkbox" id={id} class="is-hidden" name={name} checked={value} onchange={handleChange} />
          <i class={['far', value ? 'fa-check-square' : 'fa-square'].join(' ')} />
        </label>
      );
    case 'radio':
      return options.map(({ value: val, label }) => (
        <label key={val} class="radio">
          <input type="radio" class="is-hidden" name={name} value={val} checked={val === value} onchange={handleChange} />
          <i class={['far', val === value ? 'fa-dot-circle' : 'fa-circle'].join(' ')} />
          {` ${label}`}
        </label>
      ));
    default:
      return null;
  }
};

export default OptionField;

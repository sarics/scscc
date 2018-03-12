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
        <select id={id} name={name} value={value} onchange={handleChange}>
          {options.map(({ value: val, label }) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      );
    case 'text':
      return (
        <input type="text" id={id} name={name} value={value} onchange={handleChange} />
      );
    case 'checkbox':
      return (
        <input type="checkbox" id={id} name={name} checked={value} onchange={handleChange} />
      );
    case 'radio':
      return options.map(({ value: val, label }) => (
        <label key={val}>
          <input type="radio" name={name} value={val} checked={val === value} onchange={handleChange} />
          {label}
        </label>
      ));
    default:
      return null;
  }
};

export default OptionField;

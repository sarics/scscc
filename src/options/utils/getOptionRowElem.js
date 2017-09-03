export default (option, value, onChange) => {
  const rowElem = document.createElement('div');
  rowElem.className = 'row';

  const labelColElem = document.createElement('div');
  labelColElem.className = 'col';
  const labelElem = document.createElement('label');
  labelElem.htmlFor = `option-${option.name}`;
  labelElem.textContent = option.title;

  labelColElem.appendChild(labelElem);
  rowElem.appendChild(labelColElem);

  const optionColElem = document.createElement('div');
  optionColElem.className = 'col';

  let optionElem;
  if (option.type === 'string') {
    optionElem = document.createElement('input');
    optionElem.type = 'text';
    optionElem.name = option.name;
    optionElem.value = value || '';

    optionElem.addEventListener('input', onChange);
  } else if (option.type === 'bool') {
    optionElem = document.createElement('input');
    optionElem.type = 'checkbox';
    optionElem.name = option.name;
    if (value === true) optionElem.checked = true;

    optionElem.addEventListener('change', onChange);
  } else if (option.type === 'radio') {
    optionElem = document.createElement('div');

    option.options.forEach((opt) => {
      const optLabelElem = document.createElement('label');

      const radioElem = document.createElement('input');
      radioElem.type = 'radio';
      radioElem.name = option.name;
      radioElem.value = opt.value;
      if (value === opt.value) radioElem.setAttribute('checked', '');

      radioElem.addEventListener('change', onChange);

      optLabelElem.appendChild(radioElem);
      optLabelElem.appendChild(document.createTextNode(opt.label));
      optionElem.appendChild(optLabelElem);
    });
  } else if (option.type === 'menulist') {
    optionElem = document.createElement('select');
    optionElem.name = option.name;

    option.options.forEach((opt) => {
      const optElem = document.createElement('option');
      optElem.value = opt.value;
      optElem.textContent = opt.label;
      if (value === opt.value) optElem.setAttribute('selected', '');

      optionElem.appendChild(optElem);
    });

    optionElem.addEventListener('change', onChange);
  }

  if (optionElem) {
    optionElem.id = `option-${option.name}`;

    optionColElem.appendChild(optionElem);
    rowElem.appendChild(optionColElem);
  }

  return rowElem;
};

import { h } from 'hyperapp';

const ResetButton = () => {
  const handleClick = (e) => {
    e.preventDefault();

    browser.storage.local.set({ currRates: {} });
  };

  return (
    <button class="button is-light" onclick={handleClick}>Reset exchange rates</button>
  );
};

export default ResetButton;

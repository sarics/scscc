import { h } from 'hyperapp';

const ResetButton = () => {
  const handleClick = (e) => {
    e.preventDefault();

    browser.storage.local.set({ currRates: {} });
  };

  return (
    <button onclick={handleClick}>Reset exchange rates</button>
  );
};

export default ResetButton;

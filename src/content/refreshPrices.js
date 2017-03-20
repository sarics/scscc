import preferences from './storage/preferences';
import currRates from './storage/currRates';
import { formatPrice } from './utils/priceUtils';

export default () => {
  const dataNodes = document.querySelectorAll('data.scscc');

  dataNodes.forEach((dataNode) => {
    const fromCurr = dataNode.dataset.curr;
    const currRate = currRates.get(fromCurr, preferences.get('toCurr'));
    let replTxtNode;

    if (fromCurr === preferences.get('toCurr') || !currRate) {
      replTxtNode = document.createTextNode(dataNode.title);
      dataNode.parentNode.replaceChild(replTxtNode, dataNode);
    } else {
      const newPrice = parseFloat(dataNode.value) * currRate;
      const replTxt = formatPrice(newPrice, preferences.get());

      if (dataNode.textContent !== newPrice) {
        replTxtNode = document.createTextNode(replTxt);
        dataNode.replaceChild(replTxtNode, dataNode.firstChild);
      }
    }
  });
};

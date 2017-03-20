export default (curr, origTxt, origVal, formattedVal) => {
  const dataNode = document.createElement('data');

  dataNode.className = 'scscc';
  dataNode.dataset.curr = curr;
  dataNode.title = origTxt;
  dataNode.value = origVal;
  dataNode.textContent = formattedVal;

  return dataNode;
};

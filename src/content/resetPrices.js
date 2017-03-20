export default () => {
  const dataNodes = document.querySelectorAll('data.scscc');

  dataNodes.forEach((dataNode) => {
    const replTxtNode = document.createTextNode(dataNode.title);
    dataNode.parentNode.replaceChild(replTxtNode, dataNode);
  });
};

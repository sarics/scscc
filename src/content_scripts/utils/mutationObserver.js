export default (onMutation) => {
  const isDataScscc = (node) => /^data$/i.test(node.nodeName) && node.className === 'scscc';

  const checkMutations = (mutlist) => {
    mutlist.forEach((mut) => {
      mut.addedNodes.forEach((addedNode) => {
        if (!addedNode.parentNode || isDataScscc(addedNode) || (addedNode.nodeType === 3 && isDataScscc(addedNode.parentNode))) return;

        onMutation(addedNode);
      });
    });
  };

  const observer = new MutationObserver(checkMutations);

  return {
    observe: () =>
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      }),

    disconnect: observer.disconnect,
  };
};

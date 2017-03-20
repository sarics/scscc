export default (updatedAt) => {
  const updateDiff = Date.now() - updatedAt;
  let updatedTxt;

  if (updateDiff > 3600000) {
    const hourDiff = Math.floor(updateDiff / 3600000);

    updatedTxt = `more than ${hourDiff} hour`;
    if (hourDiff > 1) updatedTxt += 's';
  } else {
    const minDiff = Math.floor(updateDiff / 60000);

    if (minDiff === 0) updatedTxt = 'less than a minute';
    else if (minDiff === 1) updatedTxt = '1 minute';
    else updatedTxt = `${minDiff} minutes`;
  }

  return updatedTxt;
};

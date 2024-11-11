const HandleBigInt = (data) => {
  data = JSON.parse(JSON.stringify(data, (key, value) => (typeof value === "bigint" ? parseInt(value) : value)));

  return data;
};

export default HandleBigInt;

export const HandleItems = async (items) => {
  let tagihan = 0;

  for (const e of items) {
    const total = e.unit_price * e.quantity;

    e.total_price = total;

    tagihan += total;
  }

  return tagihan;
};

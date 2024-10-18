export const HandleTotalTagihan = async (items, shipping_cost) => {
  const fee = 4400;

  let biaya_lain = fee + shipping_cost;
  let tagihan = 0;

  for (const e of items) {
    const total = e.unit_price * e.quantity;

    e.total_price = total;

    tagihan += total;
  }

  const total = tagihan + biaya_lain;

  return {
    total_shopping: tagihan,
    total_bill: total,
    fee: fee,
  };
};

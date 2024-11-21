export const calculateFee = (amount, method, bank = null) => {
  let fee = 0;

  switch (method) {
    case "va":
      // Fixed fee for bank transfer (Virtual Account)
      fee = 4500;
      break;

    case "bank_transfer":
      // Fixed fee for bank transfer (Virtual Account)
      fee = 4500;
      break;

    case "e_wallet":
      const fees = {
        dana: 0.015, // dana: 1.5% of the amount
        astrapay: 0.015, // astrapay: 1.5% of the amount
        jenius: 0.02, // jenius: 2% of the amount
        ovo: 0.02, // ovo: 2% of the amount
        linkaja: 0.015, // linkaja: 1.5% of the amount
        shopeepay: 0.02, // shopeepay: 2% of the amount
      };

      fee = amount * fees[bank];
      break;

    case "credit_card":
      // Fee for credit card is 2.9% + Rp 2,000
      fee = amount * 0.029 + 2000;
      break;

    case "qris":
      // QRIS fee as a percentage of the amount
      fee = amount * 0.007;
      break;

    case "direct_debit":
      if (bank === "bri") {
        // Direct Debit BRI: 1.90% of the amount
        fee = amount * 0.019;
      } else if (bank === "mandiri") {
        // Direct Debit Mandiri: Fixed fee of Rp 4,500
        fee = 4500;
      } else {
        // Direct Debit General: 2% or Rp 4,500, whichever is higher
        const percentageFee = amount * 0.02;
        fee = Math.max(percentageFee, 4500);
      }
      break;

    default:
      // console.log("Metode pembayaran tidak dikenali");
      return null;
  }

  return fee;
};

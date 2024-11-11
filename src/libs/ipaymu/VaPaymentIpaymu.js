import CryptoJS from "crypto-js";
import md5 from "md5";
import { GenerateDate } from "../HandleGenerate";
import env from "dotenv";
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";

env.config({
  path: envFile,
});

// Konfigurasi iPaymu API
const apikey = process.env.IPAYMU_KEY;
const va = "0000001217333000";
const url = "https://sandbox.ipaymu.com/api/v2/payment/direct"; // development mode
// const url = "https://my.ipaymu.com/api/v2/payment/direct"; // production mode

/**
 * Melakukan pembayaran langsung ke iPaymu
 *
 * @param {Object} data - Data yang diperlukan untuk melakukan pembayaran
 * @param {String} data.customerName - Nama pelanggan
 * @param {String} data.phoneNumber - Nomor telepon pelanggan
 * @param {String} data.email - Email pelanggan
 * @param {Number} data.amount - Jumlah pembayaran
 * @param {String} data.paymentMethod - Metode pembayaran (cc, qris, va, cstore)
 * @param {String} [data.paymentChannel] - Channel pembayaran (jika metode pembayaran menggunakan `va` atau `cstore`)
 *
 * @returns {Promise<Object>} Hasil dari proses pembayaran, termasuk status, success, dan pesan dari API.
 *
 * @example
 * const DataPayment = {
 *   customerName: "John Doe",
 *   phoneNumber: "08123456789",
 *   email: "johndoe@email.com",
 *   amount: 500000,
 *   paymentMethod: "va",
 *   paymentChannel: "bca"
 * };
 *
 * DirectPaymentIpaymu(DataPayment)
 *   .then(response => {
 *     console.log(response);
 *   })
 *   .catch(error => {
 *     console.error(error);
 *   });
 */
export const DirectPaymentIpaymu = async (key, data) => {
  const date = await GenerateDate();
  const ReferenceId = md5(`${data.customerName}-${data.phoneNumber}-${data.amount}-${date}`);

  // Struktur body request
  let body = {
    name: data.customerName,
    phone: data.phoneNumber,
    email: data.email,
    amount: data.amount,
    comments: "Payment to Trumecs.com",
    notifyUrl: "https://test-transaction-production.up.railway.app/api/ipaymu-callback",
    referenceId: data.referenceId,
    escrow: true,
    feeDirection: "BUYER",
  };

  // Menentukan metode pembayaran
  if (data.paymentMethod === "va") {
    body = { ...body, paymentMethod: "va", paymentChannel: data.paymentChannel };
  } else if (["cc", "qris"].includes(data.paymentMethod)) {
    body.paymentMethod = data.paymentMethod;
  } else if (data.paymentMethod === "cstore") {
    body = { ...body, paymentMethod: "cstore", paymentChannel: data.paymentChannel };
  }

  // Generate signature
  const bodyEncrypt = CryptoJS.SHA256(JSON.stringify(body));
  const stringToSign = `POST:${va}:${bodyEncrypt}:${key}`;
  const signature = CryptoJS.enc.Hex.stringify(CryptoJS.HmacSHA256(stringToSign, apikey));

  // Mengirim request
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        va,
        signature,
      },
      body: JSON.stringify(body),
    });

    const responseJson = await response.json();
    return {
      status: responseJson.Status,
      success: responseJson.Success,
      message: responseJson.Message,
      data: responseJson.Data,
    };
  } catch (error) {
    console.error("Error:", error);
    return { status: "error", success: false, message: error.message };
  }
};

export const ReadPaymentIpaymu = async (trans_id) => {
  const url = "https://sandbox.ipaymu.com/api/v2/transaction"; // development mode
  let body = {
    transactionId: trans_id,
    // account: va,
  };

  // Generate signature
  const bodyEncrypt = CryptoJS.SHA256(JSON.stringify(body));
  const stringToSign = `POST:${va}:${bodyEncrypt}:${apikey}`;
  const signature = CryptoJS.enc.Hex.stringify(CryptoJS.HmacSHA256(stringToSign, apikey));

  // Mengirim request
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        va,
        signature,
      },
      body: JSON.stringify(body),
    });

    const responseJson = await response.json();

    return {
      status: responseJson.Status,
      success: responseJson.Success,
      message: responseJson.Message,
      data: responseJson.Data,
    };
  } catch (error) {
    console.error("Error:", error);
    return { status: "error", success: false, message: error.message };
  }
};

export const GenerateString = async () => {};

export const GenerateInvoiceID = async () => {
  const now = new Date();

  // Dapatkan tanggal (tahun, bulan, hari) dan waktu (jam, menit, detik)
  const year = now.getFullYear() % 100;

  const month = String(now.getMonth() + 1).padStart(2, "0"); // bulan dimulai dari 0
  const day = String(now.getDate()).padStart(2, "0");

  // Tambahkan beberapa angka acak di akhir
  const randomPart = Math.floor(Math.random() * 10000);

  // Gabungkan semuanya untuk membuat ID
  const invoiceID = `INV-${year}/${month}/${day}-${randomPart}`;

  return invoiceID;
};

export const GenerateDate = async () => {
  const date = Math.floor(Date.now() / 1000);
  return date;
};

// Fungsi untuk mendapatkan tanggal kedaluwarsa 1 hari dari tanggal saat ini
export const GenerateExpirationDateOneDay = async (hari = 1) => {
  const currentDate = new Date(); // Tanggal saat ini
  currentDate.setUTCDate(currentDate.getUTCDate() + hari); // Tambah 1 hari

  // Mengembalikan tanggal dalam format ISO 8601 (UTC+0)
  return currentDate.toISOString();
};

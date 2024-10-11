export const GenerateInvoiceID = () => {
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

const banks = [
  {
    name: "Mandiri",
    va: "1234567890123456",
    logo: "https://ver02.rumahpiatu.org/wp-content/uploads/2020/04/logo-mandiri.png",
  },
  {
    name: "BCA",
    va: "9876543210987654",
    logo: "https://buatlogoonline.com/wp-content/uploads/2022/10/Logo-BCA-PNG.png",
  },
  {
    name: "BNI",
    va: "1122334455667788",
    logo: "https://w7.pngwing.com/pngs/141/956/png-transparent-bank-bni-indonesia-indonesian-negara-banks-in-indonesia-logo-badge-icon.png",
  },
  {
    name: "CIMB",
    va: "5566778899001122",
    logo: "https://w7.pngwing.com/pngs/729/593/png-transparent-bank-bankers-cimb-commerce-indonesian-international-merchant-banks-in-indonesia-logo-badge-icon-thumbnail.png",
  },
];

const bankOptionsContainer = document.getElementById("bank-options");
const total_amount = document.getElementById("total-amount");
const price = document.getElementById("price");
const fee = document.getElementById("fee");
const username = document.getElementById("name");
const phone = document.getElementById("phone");
const email = document.getElementById("email");
const formInformation = document.getElementById("FormInformation");
const loading = document.getElementById("loading");
const PaymentContainer = document.getElementById("PaymentContainer");
const invoice = window.localStorage.getItem("invoice");
const invoice_id = document.getElementById("invoice_id");
const detailUsername = document.getElementById("detailUsername");
const detailPhone = document.getElementById("detailPhone");
const detailEmail = document.getElementById("detailEmail");
const detailShipping = document.getElementById("detailShipping");
const newInvoice = document.getElementById("new-invoice");
const imgBank = document.getElementById("imgBank");
const va_number = document.getElementById("va_number");
const detailStatus = document.getElementById("status");
const InvoiceDetail = document.getElementById("InvoiceDetail");
const expiry_date = document.getElementById("expiry_date");
const total_amount_detail = document.getElementById("total_amount_detail");

let selectedVA = null;
function checkCurrentProtocol() {
  const protocol = window.location.protocol;
  if (protocol === "https:") {
    return true;
  } else {
    return false;
  }
}

const cekUrl = checkCurrentProtocol();
let url;
if (cekUrl) {
  url = "https://payment.hundredapps.co";
} else {
  url = "http://192.168.1.228:3000";
}

async function loadInvoice() {
  if (invoice) {
    loading.classList.remove("hidden");
    const data = JSON.parse(invoice);
    PaymentContainer.classList.add("hidden");
    InvoiceDetail.classList.remove("hidden");

    try {
      const response = await fetch(`${url}/api/transaction-read/${data.data.unique_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseData = await response.json();

      loading.classList.add("hidden");

      if (!responseData.success) {
        window.localStorage.clear();
        InvoiceDetail.classList.add("hidden");
        PaymentContainer.classList.remove("hidden");
      }

      const date = new Date(responseData.data.expiry_date * 1000); // Konversi ke milidetik

      // Ambil elemen tanggal, bulan, tahun, jam, menit, dan detik
      const day = date.getDate();
      const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Pastikan dua digit
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, "0"); // Pastikan dua digit
      const minutes = date.getMinutes().toString().padStart(2, "0"); // Pastikan dua digit

      // Formatkan output
      expiry_date.textContent = `Expiry Date : ${day} ${month} ${year} ${hours}:${minutes}`;

      // Lanjutkan manipulasi DOM
      detailUsername.textContent = `Penerima : ${data.data.customer_name}`;
      detailPhone.textContent = data.data.phone_number;
      detailEmail.textContent = data.data.email;
      detailShipping.textContent = data.data.shipping_information;
      va_number.textContent = data.data.payment_code;
      invoice_id.textContent = data.data.invoice_id;
      total_amount_detail.textContent = "Rp" + responseData.data.total_bill.toLocaleString("id-ID");

      switch (data.data.payment_method.split("-")[1].toLowerCase()) {
        case "bca":
          imgBank.src = "https://buatlogoonline.com/wp-content/uploads/2022/10/Logo-BCA-PNG.png";
          break;
        case "mandiri":
          imgBank.src = "https://ver02.rumahpiatu.org/wp-content/uploads/2020/04/logo-mandiri.png";
          break;
        case "bni":
          imgBank.src =
            "https://w7.pngwing.com/pngs/141/956/png-transparent-bank-bni-indonesia-indonesian-negara-banks-in-indonesia-logo-badge-icon.png";
          break;
        case "cimb":
          imgBank.src =
            "https://w7.pngwing.com/pngs/729/593/png-transparent-bank-bankers-cimb-commerce-indonesian-international-merchant-banks-in-indonesia-logo-badge-icon-thumbnail.png";
          break;

        default:
          imgBank.src = `https://via.placeholder.com/100x50?text=${data.data.payment_method.toUpperCase()}`;
          break;
      }

      detailStatus.textContent = responseData.data.status;

      if (responseData.data.status === "paid") {
        detailStatus.classList.add("bg-green-500");
      } else if (responseData.data.status === "pending") {
        detailStatus.classList.add("bg-gray-500");
      } else {
        detailStatus.classList.add("bg-red-500");
      }
    } catch (error) {
      // console.error("Error fetching transaction data:", error);
    }
  }
}

// Panggil fungsi async ini
loadInvoice();

let priceProduct = 10000;
let tax = 4000;

let amount = priceProduct + tax;

price.textContent = "Rp" + priceProduct.toLocaleString("id-ID");
fee.textContent = "Rp" + tax.toLocaleString("id-ID");
total_amount.textContent = "Rp" + amount.toLocaleString("id-ID");

banks.forEach((bank, index) => {
  const bankCard = document.createElement("div");
  bankCard.classList.add(
    "border",
    "rounded-lg",
    "p-4",
    "flex",
    "flex-col",
    "items-center",
    "cursor-pointer",
    "hover:shadow-lg",
    "transition",
    "duration-300"
  );
  bankCard.innerHTML = `
        <img src="${bank.logo}" alt="${bank.name}" class="w-24 h-10 mb-2 object-cover">
        <p class="font-semibold">Bank ${bank.name}</p>
    `;
  bankCard.addEventListener("click", () => {
    // Highlight the selected bank
    document.querySelectorAll("#bank-options > div").forEach((card) => {
      card.classList.remove("border-blue-500", "shadow-md");
    });
    bankCard.classList.add("border-blue-500", "shadow-md");
    selectedVA = bank.name;
  });
  bankOptionsContainer.appendChild(bankCard);
});

newInvoice.addEventListener("click", () => {
  window.localStorage.clear();
  window.location.reload();
});

function generateInvoiceId() {
  const timestamp = Date.now(); // Waktu saat ini dalam milidetik
  const random = Math.floor(Math.random() * 100000); // Angka acak 5 digit
  return `INV-${timestamp}-${random}`;
}

document.getElementById("pay-button").addEventListener("click", async (e) => {
  e.preventDefault();

  loading.classList.remove("hidden");
  const invoice_id = generateInvoiceId();

  if (selectedVA) {
    const data = {
      invoice_id: invoice_id,
      payment_method: "va",
      payment_channel: selectedVA.toLowerCase(),
      escrow: true,
      client: "chitchat",
      customer_name: username.value,
      phone_number: phone.value,
      email: email.value,
      shipping_cost: 0,
      store_name: "anz sports",
      shipping_information:
        "Jln.Bbd Raya Komplek Bank Bumi Daya Blok B1 No. 91 Cimanggis, Kota Depok, 16452 Jawa Barat",
      items: [
        {
          category: "pelumas",
          name: "Pelumas Pertamina",
          quantity: 1,
          unit_price: priceProduct,
          weight: "20 kg",
          description: "ga pake cabe",
        },
      ],
    };

    try {
      const response = await fetch(`${url}/api/transaction-create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      loading.classList.add("hidden");

      if (!response.ok) {
        // throw new Error(`HTTP error! status: ${response.status}`);
        alert("error");
        return;
      }

      const result = await response.json();
      // console.log(result);

      window.localStorage.setItem("invoice", JSON.stringify(result));
      window.location.reload();
    } catch (error) {
      console.error("Error during fetch:", error);
      // alert("An error occurred while processing the payment. Please try again.");
    }
  } else {
    alert("Please select a payment method.");
  }
});

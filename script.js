// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDIog8cGM6HWbSj-02rUOh9Wn9JahPix2U",
  authDomain: "wanmoein-kopi.firebaseapp.com",
  databaseURL: "https://wanmoein-kopi-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "wanmoein-kopi",
  storageBucket: "wanmoein-kopi.firebasestorage.app",
  messagingSenderId: "434124582679",
  appId: "1:434124582679:web:952776c6a04e6390981152",
};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();

const cart = [];

const cartItems = document.getElementById("cart-items");
const totalText = document.getElementById("total");

function addToCart(menu,harga){

  const existing = cart.find(item => item.menu === menu);

  if(existing){
    existing.qty += 1;
  }else{
    cart.push({
      menu,
      harga,
      qty:1
    });
  }

  renderCart();
}

function renderCart(){

  cartItems.innerHTML = "";

  let total = 0;

  cart.forEach(item => {

    total += item.harga * item.qty;

    cartItems.innerHTML += `
      <div class="cart-item">

        <div>
          ${item.menu}
          (${item.qty}x)
        </div>

        <div>
          Rp ${(item.harga * item.qty).toLocaleString('id-ID')}
        </div>

      </div>
    `;
  });

  totalText.innerText = total.toLocaleString('id-ID');
}

document
  .getElementById("orderForm")
  .addEventListener("submit", async (e) => {

    e.preventDefault();

    if(cart.length === 0){
      alert("Keranjang masih kosong 😭");
      return;
    }

    const nama = document.getElementById("nama").value;
    const meja = document.getElementById("meja").value;

    const snapshot = await db.ref("orders").once("value");

    const antrian = snapshot.numChildren() + 1;

    let total = 0;

    cart.forEach(item => {
      total += item.harga * item.qty;
    });

    const data = {
      nama,
      meja,
      antrian,
      status:"pending",
      orders:cart,
      total,
      createdAt:Date.now()
    };

    await db.ref("orders").push(data);

    alert(
      `Pesanan berhasil ☕\n\nNomor Antrian: ${antrian}`
    );

    cart.length = 0;

    renderCart();

    document.getElementById("orderForm").reset();
});

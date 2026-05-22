// script.js

// ======================
// FIREBASE CONFIG
// ======================

const firebaseConfig = {
  apiKey: "AIzaSyDIog8cGM6HWbSj-02rUOh9Wn9JahPix2U",
  authDomain: "wanmoein-kopi.firebaseapp.com",
  databaseURL: "https://wanmoein-kopi-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "wanmoein-kopi",
  storageBucket: "wanmoein-kopi.firebasestorage.app",
  messagingSenderId: "434124582679",
  appId: "1:434124582679:web:952776c6a04e6390981152"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();

// ======================
// GLOBAL
// ======================

const cart = [];

const cartItems =
  document.getElementById("cart-items");

const totalText =
  document.getElementById("total");

const menuContainer =
  document.getElementById("menu-container");

// ======================
// LOAD MENU FIREBASE
// ======================

function loadMenus(){

  db.ref("menus").on("value",(snapshot)=>{

    const data = snapshot.val();

    menuContainer.innerHTML = "";

    if(!data){

      menuContainer.innerHTML = `
        <p>Menu belum tersedia ☕</p>
      `;

      return;
    }

    Object.values(data).forEach(menu => {

      menuContainer.innerHTML += `

        <div class="menu-card">

          <img src="${menu.gambar}">

          <h3>
            ${menu.nama}
          </h3>

          <p>
            Rp ${menu.harga.toLocaleString('id-ID')}
          </p>

          <button
            onclick="addToCart('${menu.nama}', ${menu.harga})"
          >
            Tambah
          </button>

        </div>

      `;

    });

  });

}

// ======================
// ADD TO CART
// ======================

function addToCart(menu,harga){

  const existing =
    cart.find(item => item.menu === menu);

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

// ======================
// RENDER CART
// ======================

function renderCart(){

  cartItems.innerHTML = "";

  let total = 0;

  if(cart.length === 0){

    cartItems.innerHTML = `
      <p class="empty-cart">
        Keranjang masih kosong ☕
      </p>
    `;

    totalText.innerText = "0";

    return;
  }

  cart.forEach((item,index)=>{

    total += item.harga * item.qty;

    cartItems.innerHTML += `

      <div class="cart-item">

        <div class="cart-left">

          <h4>
            ${item.menu}
          </h4>

          <p>
            Rp ${item.harga.toLocaleString('id-ID')}
          </p>

        </div>

        <div class="cart-right">

          <button
            class="qty-btn"
            onclick="decreaseQty(${index})"
          >
            -
          </button>

          <span class="qty">
            ${item.qty}
          </span>

          <button
            class="qty-btn"
            onclick="increaseQty(${index})"
          >
            +
          </button>

          <button
            class="delete-btn"
            onclick="removeItem(${index})"
          >
            🗑
          </button>

        </div>

      </div>

    `;

  });

  totalText.innerText =
    total.toLocaleString('id-ID');

}

// ======================
// INCREASE QTY
// ======================

function increaseQty(index){

  cart[index].qty++;

  renderCart();

}

// ======================
// DECREASE QTY
// ======================

function decreaseQty(index){

  if(cart[index].qty > 1){

    cart[index].qty--;

  }else{

    cart.splice(index,1);

  }

  renderCart();

}

// ======================
// REMOVE ITEM
// ======================

function removeItem(index){

  cart.splice(index,1);

  renderCart();

}

// ======================
// SUBMIT ORDER
// ======================

document
  .getElementById("orderForm")
  .addEventListener("submit", async (e)=>{

    e.preventDefault();

    if(cart.length === 0){

      alert("Keranjang masih kosong 😭");

      return;

    }

    const nama =
      document.getElementById("nama").value;

    const meja =
      document.getElementById("meja").value;

    // AMBIL JUMLAH ORDER
    const snapshot =
      await db.ref("orders").once("value");

    const antrian =
      snapshot.numChildren() + 1;

    // HITUNG TOTAL
    let total = 0;

    cart.forEach(item => {

      total += item.harga * item.qty;

    });

    // DATA ORDER
    const data = {

      nama,
      meja,

      antrian,

      status:"pending",

      orders:[...cart],

      total,

      createdAt: Date.now()

    };

    // PUSH KE FIREBASE
    await db.ref("orders").push(data);

    // SHOW POPUP
    showPopup(antrian);

    // RESET CART
    cart.length = 0;

    renderCart();

    document
      .getElementById("orderForm")
      .reset();

});

// ======================
// POPUP
// ======================

function showPopup(antrian){

  document
    .getElementById("queue-number")
    .innerText = "#" + antrian;

  document
    .getElementById("popup")
    .style.display = "flex";

}

function closePopup(){

  document
    .getElementById("popup")
    .style.display = "none";

}

// ======================
// TRACK ORDER
// ======================

document
  .getElementById("trackForm")
  .addEventListener("submit", async (e)=>{

    e.preventDefault();

    const queue =
      document.getElementById("trackInput").value;

    const result =
      document.getElementById("tracking-result");

    const snapshot =
      await db.ref("orders").once("value");

    const data = snapshot.val();

    if(!data){

      result.innerHTML = `
        <p>Pesanan tidak ditemukan 😭</p>
      `;

      return;

    }

    let found = null;

    Object.values(data).forEach(item => {

      if(item.antrian == queue){

        found = item;

      }

    });

    if(!found){

      result.innerHTML = `
        <p>Nomor antrian tidak ditemukan 😭</p>
      `;

      return;

    }

    let statusClass = "";
    let statusText = "";

    if(found.status === "pending"){

      statusClass = "pending-status";
      statusText = "Pending ☕";

    }

    if(found.status === "diproses"){

      statusClass = "process-status";
      statusText = "Diproses 👨‍🍳";

    }

    if(found.status === "selesai"){

      statusClass = "done-status";
      statusText = "Siap Diambil ✅";

    }

    result.innerHTML = `

      <div class="track-card">

        <h3>
          #${found.antrian}
        </h3>

        <p>
          ${found.nama}
        </p>

        <div class="track-status ${statusClass}">
          ${statusText}
        </div>

      </div>

    `;

});

// ======================
// INIT
// ======================

renderCart();

loadMenus();

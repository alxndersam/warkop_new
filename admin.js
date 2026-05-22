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
// CHART
// ======================
let chartInstance = null;

function renderChart(dailyData){
  const ctx = document.getElementById("salesChart");

  const labels = Object.keys(dailyData);
  const values = Object.values(dailyData);

  if(chartInstance){
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Penjualan (Rp)",
        data: values,
        borderWidth: 2,
        tension: 0.3
      }]
    }
  });
}

// ======================
// ANALYTICS
// ======================
function getDailySales(data){
  const daily = {};

  Object.values(data).forEach(order => {
    const date = order.date || "unknown";

    if(!daily[date]){
      daily[date] = 0;
    }

    daily[date] += order.total;
  });

  return daily;
}

// ======================
// DASHBOARD REALTIME
// ======================
db.ref("orders").on("value",(snapshot)=>{

  const data = snapshot.val();

  let totalSales = 0;
  let totalOrders = 0;
  let menuCount = {};

  if(data){

    Object.values(data).forEach(order => {

      totalSales += order.total;
      totalOrders++;

      order.orders.forEach(item => {
        menuCount[item.menu] =
          (menuCount[item.menu] || 0) + item.qty;
      });

    });

    // BEST MENU
    let bestMenu = "-";
    let highest = 0;

    Object.entries(menuCount).forEach(([menu,qty])=>{
      if(qty > highest){
        highest = qty;
        bestMenu = menu;
      }
    });

    document.getElementById("total-sales").innerText =
      "Rp " + totalSales.toLocaleString("id-ID");

    document.getElementById("total-orders").innerText =
      totalOrders;

    document.getElementById("best-menu").innerText =
      bestMenu;

    // 📊 CHART
    const daily = getDailySales(data);
    renderChart(daily);

  }

});

// ======================
// ORDERS + MENU (tetap seperti kamu)
// ======================

const container = document.getElementById("orders-container");
const menuList = document.getElementById("menu-list");

// REALTIME ORDERS
db.ref("orders").on("value",(snapshot)=>{

  const data = snapshot.val();
  container.innerHTML = "";

  if(!data){
    container.innerHTML = `<div class="empty">Belum ada pesanan ☕</div>`;
    return;
  }

  Object.entries(data).reverse().forEach(([id,item])=>{

    let ordersHTML = "";

    item.orders.forEach(order=>{
      ordersHTML += `
        <div class="order-item">
          <div>${order.menu} (${order.qty}x)</div>
          <div>Rp ${(order.harga * order.qty).toLocaleString("id-ID")}</div>
        </div>
      `;
    });

    let statusClass = item.status;

    container.innerHTML += `
      <div class="order-card">
        <div class="top-order">
          <h2>#${item.antrian}</h2>
          <span class="status ${statusClass}">
            ${item.status}
          </span>
        </div>

        <p class="customer">${item.nama} • Meja ${item.meja}</p>

        <div class="order-list">${ordersHTML}</div>

        <div class="total-price">
          Total: Rp ${item.total.toLocaleString("id-ID")}
        </div>

        <div class="actions">
          <button class="process-btn"
            onclick="updateStatus('${id}','diproses')">
            Diproses
          </button>

          <button class="done-btn"
            onclick="updateStatus('${id}','selesai')">
            Selesai
          </button>
        </div>
      </div>
    `;
  });

});

// UPDATE STATUS
function updateStatus(id,status){
  db.ref("orders/" + id).update({ status });
}

// MENU ADMIN (tetap)
document.getElementById("menuForm")
.addEventListener("submit", async (e)=>{

  e.preventDefault();

  const nama = document.getElementById("menuNama").value;
  const harga = parseInt(document.getElementById("menuHarga").value);
  const gambar = document.getElementById("menuGambar").value;

  await db.ref("menus").push({
    nama, harga, gambar
  });

  e.target.reset();
});

// LOAD MENU ADMIN
db.ref("menus").on("value",(snapshot)=>{

  const data = snapshot.val();
  menuList.innerHTML = "";

  if(!data){
    menuList.innerHTML = "<p>Belum ada menu ☕</p>";
    return;
  }

  Object.entries(data).forEach(([id,menu])=>{
    menuList.innerHTML += `
      <div class="menu-admin-card">
        <div>
          <h3>${menu.nama}</h3>
          <p>Rp ${menu.harga.toLocaleString("id-ID")}</p>
        </div>
        <button onclick="deleteMenu('${id}')">Hapus</button>
      </div>
    `;
  });

});

function deleteMenu(id){
  db.ref("menus/" + id).remove();
}

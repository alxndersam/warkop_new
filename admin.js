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
// NOTIF SOUND
// ======================
const notifSound = new Audio("https://www.soundjay.com/buttons/sounds/button-3.mp3");

// ======================
// CHART
// ======================
let chartInstance = null;

function renderChart(data){
  const ctx = document.getElementById("salesChart");

  const labels = Object.keys(data);
  const values = Object.values(data);

  if(chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type:"line",
    data:{
      labels,
      datasets:[{
        label:"Penjualan",
        data:values,
        borderWidth:2,
        tension:0.3
      }]
    }
  });
}

// ======================
// ANALYTICS
// ======================
function getDaily(data){
  const daily = {};

  Object.values(data).forEach(o=>{
    const d = o.date || "unknown";
    daily[d] = (daily[d] || 0) + o.total;
  });

  return daily;
}

// ======================
// DASHBOARD LIVE
// ======================
let lastCount = 0;

db.ref("orders").on("value",(snap)=>{

  const data = snap.val();

  let totalSales = 0;
  let totalOrders = 0;
  let menuCount = {};

  if(data){

    const keys = Object.keys(data);

    // 🔔 NOTIF ORDER BARU
    if(lastCount !== 0 && keys.length > lastCount){
      notifSound.play();

      document.body.style.background = "#3a281d";
      setTimeout(()=>document.body.style.background="#2b1d14",150);
    }

    lastCount = keys.length;

    Object.values(data).forEach(o=>{
      totalSales += o.total;
      totalOrders++;

      o.orders.forEach(i=>{
        menuCount[i.menu] = (menuCount[i.menu]||0)+i.qty;
      });
    });

    let best="-",max=0;
    Object.entries(menuCount).forEach(([m,q])=>{
      if(q>max){max=q;best=m;}
    });

    document.getElementById("total-orders").innerText = totalOrders;
    document.getElementById("total-sales").innerText =
      "Rp "+totalSales.toLocaleString("id-ID");

    document.getElementById("best-menu").innerText = best;

    renderChart(getDaily(data));
  }

});

// ======================
// ORDERS REALTIME
// ======================
const container = document.getElementById("orders-container");

db.ref("orders").on("value",(snap)=>{

  const data = snap.val();
  container.innerHTML="";

  if(!data){
    container.innerHTML="<div class='empty'>Belum ada pesanan</div>";
    return;
  }

  Object.entries(data).reverse().forEach(([id,o])=>{

    let items="";

    o.orders.forEach(i=>{
      items+=`
        <div class="order-item">
          <span>${i.menu} (${i.qty})</span>
          <span>Rp ${(i.qty*i.harga).toLocaleString("id-ID")}</span>
        </div>
      `;
    });

    container.innerHTML+=`
      <div class="order-card">
        <div class="top-order">
          <h2>#${o.antrian}</h2>
          <span class="status ${o.status}">${o.status}</span>
        </div>

        <p>${o.nama} • Meja ${o.meja}</p>

        ${items}

        <div class="total-price">
          Total: Rp ${o.total.toLocaleString("id-ID")}
        </div>

        <div class="actions">
          <button class="process-btn"
            onclick="update('${id}','diproses')">Proses</button>

          <button class="done-btn"
            onclick="update('${id}','selesai')">Selesai</button>
        </div>
      </div>
    `;
  });

});

// ======================
// UPDATE STATUS
// ======================
function update(id,status){
  db.ref("orders/"+id).update({status});
}

// ======================
// MENU
// ======================
document.getElementById("menuForm")
.addEventListener("submit",async e=>{
  e.preventDefault();

  await db.ref("menus").push({
    nama:menuNama.value,
    harga:+menuHarga.value,
    gambar:menuGambar.value
  });

  e.target.reset();
});

// load menu
db.ref("menus").on("value",snap=>{
  const data=snap.val();
  const list=document.getElementById("menu-list");
  list.innerHTML="";

  if(!data){
    list.innerHTML="<p>Belum ada menu</p>";
    return;
  }

  Object.entries(data).forEach(([id,m])=>{
    list.innerHTML+=`
      <div class="menu-admin-card">
        <div>
          <h3>${m.nama}</h3>
          <p>Rp ${m.harga.toLocaleString("id-ID")}</p>
        </div>
        <button onclick="db.ref('menus/${id}').remove()">Hapus</button>
      </div>
    `;
  });
});

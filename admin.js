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

const container =
  document.getElementById("orders-container");

// REALTIME ORDERS
db.ref("orders").on("value",(snapshot)=>{

  const data = snapshot.val();

  container.innerHTML = "";

  if(!data){

    container.innerHTML = `
      <div class="empty">
        Belum ada pesanan ☕
      </div>
    `;

    return;
  }

  Object.entries(data)
    .reverse()
    .forEach(([id,item])=>{

      let ordersHTML = "";

      item.orders.forEach(order => {

        ordersHTML += `

          <div class="order-item">

            <div>
              ${order.menu}
              (${order.qty}x)
            </div>

            <div>
              Rp ${(order.harga * order.qty)
                .toLocaleString('id-ID')}
            </div>

          </div>

        `;
      });

      let statusClass = "";

      if(item.status === "pending"){
        statusClass = "pending";
      }

      if(item.status === "diproses"){
        statusClass = "process";
      }

      if(item.status === "selesai"){
        statusClass = "done";
      }

      container.innerHTML += `

        <div class="order-card">

          <div class="top-order">

            <h2>
              #${item.antrian}
            </h2>

            <span class="status ${statusClass}">
              ${item.status}
            </span>

          </div>

          <p class="customer">
            ${item.nama}
            • Meja ${item.meja}
          </p>

          <div class="order-list">

            ${ordersHTML}

          </div>

          <div class="total-price">

            Total:
            Rp ${item.total
              .toLocaleString('id-ID')}

          </div>

          <div class="actions">

            <button
              class="process-btn"
              onclick="updateStatus('${id}','diproses')"
            >
              Diproses
            </button>

            <button
              class="done-btn"
              onclick="updateStatus('${id}','selesai')"
            >
              Selesai
            </button>

          </div>

        </div>

      `;
    });
});

// UPDATE STATUS
function updateStatus(id,status){

  db.ref("orders/" + id).update({
    status
  });

}

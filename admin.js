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

const container = document.getElementById("orders-container");

db.ref("orders").on("value",(snapshot)=>{

  const data = snapshot.val();

  container.innerHTML = "";

  if(!data){
    container.innerHTML = "<h2>Belum ada pesanan 😴</h2>";
    return;
  }

  Object.entries(data).reverse().forEach(([id,item])=>{

    let ordersHTML = "";

    item.orders.forEach(order => {

      ordersHTML += `
        <div class="order-item">

          <span>
            ${order.menu} (${order.qty}x)
          </span>

          <span>
            Rp ${(order.harga * order.qty).toLocaleString('id-ID')}
          </span>

        </div>
      `;
    });

    container.innerHTML += `
      <div class="order-card">

        <h2>
          Antrian #${item.antrian}
        </h2>

        <p>
          <b>${item.nama}</b>
          • Meja ${item.meja}
        </p>

        <div class="order-list">
          ${ordersHTML}
        </div>

        <h3>
          Total:
          Rp ${item.total.toLocaleString('id-ID')}
        </h3>

        <div class="status">
          Status:
          ${item.status}
        </div>

        <div class="actions">

          <button
            class="process"
            onclick="updateStatus('${id}','diproses')"
          >
            Diproses
          </button>

          <button
            class="done"
            onclick="updateStatus('${id}','selesai')"
          >
            Selesai
          </button>

        </div>

      </div>
    `;
  });

});

function updateStatus(id,status){

  db.ref("orders/" + id).update({
    status
  });

}

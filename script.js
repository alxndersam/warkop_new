let total = 0;

function addToCart(name, price){

  const cartItems = document.getElementById('cart-items');

  const item = document.createElement('div');

  item.classList.add('cart-item');

  item.innerHTML = `
    <span>${name}</span>
    <span>Rp ${price.toLocaleString('id-ID')}</span>
  `;

  cartItems.appendChild(item);

  total += price;

  document.getElementById('total').innerText =
    total.toLocaleString('id-ID');
}

function payNow(){

  if(total === 0){
    alert('Keranjang masih kosong 😭');
    return;
  }

  document.getElementById('success').style.display = 'block';
}

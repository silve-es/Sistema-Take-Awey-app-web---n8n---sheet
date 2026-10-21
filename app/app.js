// URL de Webhook en n8n
const N8N_WEBHOOK_URL = 'https://ericc.app.n8n.cloud/webhook/integracion board punto de venta postman';

// Catálogo de 3 Productos Iniciales
const productos = [
  {
    id: 1,
    nombre: 'Pizza Muzzarella',
    categoria: 'pizzas',
    descripcion: 'Salsa de tomate casera, abundante muzzarella y aceitunas verdes.',
    precio: 9000
  },
  {
    id: 2,
    nombre: 'Empanada de Carne Cortada a Cuchillo',
    categoria: 'empanadas',
    descripcion: 'Relleno tradicional salteño con huevo y cebolla de verdeo.',
    precio: 1500
  },
  {
    id: 3,
    nombre: 'Coca-Cola Original 1.5L',
    categoria: 'bebidas',
    descripcion: 'Gaseosa refrescante ideal para compartir.',
    precio: 3000
  }
];

// Estado del Carrito
let carrito = [];

// Inicializar la App
document.addEventListener('DOMContentLoaded', () => {
  renderizarProductos(productos);
});

// Renderizar Productos en la Grilla
function renderizarProductos(items) {
  const grid = document.getElementById('products-grid');
  grid.innerHTML = '';

  items.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-info">
        <h3>${prod.nombre}</h3>
        <p>${prod.descripcion}</p>
        <div class="product-price">$${prod.precio.toLocaleString('es-AR')}</div>
      </div>
      <button class="btn-add" onclick="agregarAlCarrito(${prod.id})">+ Agregar</button>
    `;
    grid.appendChild(card);
  });
}

// Filtrar Categorías
function filtrarCategoria(cat) {
  document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  if (cat === 'todas') {
    renderizarProductos(productos);
  } else {
    const filtrados = productos.filter(p => p.categoria === cat);
    renderizarProductos(filtrados);
  }
}

// Agregar al Carrito
function agregarAlCarrito(id) {
  const prod = productos.find(p => p.id === id);
  const itemExistente = carrito.find(item => item.id === id);

  if (itemExistente) {
    itemExistente.cantidad++;
  } else {
    carrito.push({ ...prod, cantidad: 1 });
  }

  actualizarCarritoUI();
}

// Actualizar UI del Carrito
function actualizarCarritoUI() {
  const count = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  const total = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  const cartBar = document.getElementById('cart-bar');
  document.getElementById('cart-count').textContent = count;
  document.getElementById('cart-bar-total').textContent = `$${total.toLocaleString('es-AR')}`;
  document.getElementById('modal-total').textContent = `$${total.toLocaleString('es-AR')}`;

  if (count > 0) {
    cartBar.classList.remove('hidden');
  } else {
    cartBar.classList.add('hidden');
    cerrarModalCarrito();
  }

  renderizarItemsModal();
}

// Renderizar ítems dentro del Modal
function renderizarItemsModal() {
  const container = document.getElementById('cart-items-container');
  container.innerHTML = '';

  carrito.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div>
        <strong>${item.nombre}</strong>
        <div>$${(item.precio * item.cantidad).toLocaleString('es-AR')}</div>
      </div>
      <div class="qty-controls">
        <button onclick="cambiarCantidad(${item.id}, -1)">-</button>
        <span>${item.cantidad}</span>
        <button onclick="cambiarCantidad(${item.id}, 1)">+</button>
      </div>
    `;
    container.appendChild(div);
  });
}

// Cambiar Cantidad
function cambiarCantidad(id, cambio) {
  const item = carrito.find(i => i.id === id);
  if (item) {
    item.cantidad += cambio;
    if (item.cantidad <= 0) {
      carrito = carrito.filter(i => i.id !== id);
    }
  }
  actualizarCarritoUI();
}

// Abrir/Cerrar Modal
function abrirModalCarrito() {
  document.getElementById('cart-modal').classList.remove('hidden');
}

function cerrarModalCarrito() {
  document.getElementById('cart-modal').classList.add('hidden');
}

// Confirmar Pedido y enviar a n8n
async function confirmarPedido() {
  if (carrito.length === 0) return;

  const btnCheckout = document.getElementById('btn-checkout');
  const statusMessage = document.getElementById('status-message');

  const idTransaccion = `TX-${Math.floor(10000 + Math.random() * 90000)}`;
  const total = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const resumenProductos = carrito.map(i => `${i.cantidad}x ${i.nombre}`).join(', ');

  const payload = {
    id_transaccion: idTransaccion,
    timestamp: new Date().toISOString(),
    sucursal: document.getElementById('sucursal').value,
    producto: resumenProductos,
    cantidad: carrito.reduce((acc, i) => acc + i.cantidad, 0),
    monto_total: total,
    metodo_pago: document.getElementById('metodo_pago').value
  };

  btnCheckout.disabled = true;
  btnCheckout.textContent = '⌛ Enviando pedido...';
  statusMessage.className = 'status-message hidden';

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      statusMessage.textContent = `✅ ¡Pedido ${idTransaccion} registrado con éxito!`;
      statusMessage.className = 'status-message success';
      setTimeout(() => {
        carrito = [];
        actualizarCarritoUI();
        cerrarModalCarrito();
        statusMessage.className = 'status-message hidden';
      }, 2500);
    } else {
      throw new Error(`Error en el servidor de n8n (${response.status})`);
    }
  } catch (error) {
    statusMessage.textContent = `❌ Error al enviar el pedido: ${error.message}`;
    statusMessage.className = 'status-message error';
  } finally {
    btnCheckout.disabled = false;
    btnCheckout.textContent = '🚀 Confirmar y Pagar';
  }
}
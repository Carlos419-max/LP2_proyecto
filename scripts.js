// --- Lógica del Pedido (Laboratorio 03) ---
const catalogo = [
  { producto: "Palta Fuerte", precio: 45.0, stock: 8 },
  { producto: "Tomate Italiano", precio: 4.0, stock: 140 },
  { producto: "Papa Amarilla", precio: 3.5, stock: 15 },
  { producto: "Limon sutil", precio: 6.0, stock: 220 }
];
const pedido = []; // { producto, precio, cantidad }

function calcularDescuento(cantidad, subtotal) {
  let tasa = 0;
  if (cantidad >= 100) tasa = 0.12;
  else if (cantidad >= 50) tasa = 0.08;
  else if (cantidad >= 20) tasa = 0.05;
  return subtotal * tasa;
}

function calcularPedido(items) {
  let subtotal = 0, descuento = 0;
  for (const it of items) {
    const parcial = it.cantidad * it.precio;
    subtotal += parcial;
    descuento += calcularDescuento(it.cantidad, parcial);
  }
  const base = subtotal - descuento;
  const igv = base * 0.18;
  return { subtotal, descuento, igv, total: base + igv };
}

const cont = document.getElementById("catalogo");

function pintarCatalogo(lista) {
  if (!cont) return;
  cont.innerHTML = "";
  lista.forEach((p) => {
    const art = document.createElement("article");
    art.className = "tarjeta";
    if (p.stock < 20) art.classList.add("stock-critico");
    art.textContent = `${p.producto} — S/ ${p.precio.toFixed(2)} (stock: ${p.stock}) `;

    const campo = document.createElement("input");
    campo.type = "number"; campo.min = "1"; campo.value = "1";

    const btn = document.createElement("button");
    btn.textContent = "Agregar";
    btn.addEventListener("click", () => agregar(p, campo));

    art.appendChild(campo);
    art.appendChild(btn);
    cont.appendChild(art);
  });
}

function agregar(p, campo) {
  const cantidad = Number(campo.value);
  const aviso = document.getElementById("mensaje");

  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    if (aviso) mostrarAviso(aviso, "Ingrese una cantidad válida (entero > 0).");
    return;
  }
  if (cantidad > p.stock) {
    if (aviso) mostrarAviso(aviso, `Stock insuficiente: quedan ${p.stock} unidades.`);
    return;
  }

  if (aviso) aviso.classList.add("oculto");
  pedido.push({ producto: p.producto, precio: p.precio, cantidad });
  actualizarResumen();
  const btnG = document.getElementById("btnGuardar");
  if (btnG) btnG.disabled = false;
}

function mostrarAviso(el, texto) {
  if (!el) return;
  el.textContent = texto;
  el.classList.remove("oculto");
  el.classList.add("error");
}

function actualizarResumen() {
  const r = calcularPedido(pedido);
  const elContador = document.getElementById("contador");
  const elSubtotal = document.getElementById("subtotal");
  const elDescuento = document.getElementById("descuento");
  const elIgv = document.getElementById("igv");
  const elTotal = document.getElementById("total");

  if (elContador) elContador.textContent = pedido.length;
  if (elSubtotal) elSubtotal.textContent = fmt(r.subtotal);
  if (elDescuento) elDescuento.textContent = fmt(r.descuento);
  if (elIgv) elIgv.textContent = fmt(r.igv);
  if (elTotal) elTotal.textContent = fmt(r.total);
}

const fmt = (m) => `S/ ${m.toFixed(2)}`;

const elBuscar = document.getElementById("buscar");
if (elBuscar) {
  elBuscar.addEventListener("input", (e) => {
    const t = e.target.value.toLowerCase();
    pintarCatalogo(catalogo.filter(p => p.producto.toLowerCase().includes(t)));
  });
}

if (cont) {
  pintarCatalogo(catalogo);
}

// --- Consulta Asíncrona de Tipo de Cambio (API Solicitada por el Usuario) ---
const URL_TC = "https://api.frankfurter.dev/v2/rate/usd/pen";

async function consultarTipoCambio() {
  const salida = document.getElementById("tc");
  if (!salida) return;
  salida.textContent = "Consultando…";
  try {
    const respuesta = await fetch(URL_TC);
    if (!respuesta.ok) throw new Error(respuesta.status);
    const datos = await respuesta.json();
    const valorRate = datos.rate ?? datos.rates?.PEN ?? datos.value;
    if (typeof valorRate === "number") {
      salida.textContent = `S/ ${valorRate.toFixed(3)} por USD`;
    } else {
      salida.textContent = "S/ - por USD";
    }
  } catch (error) {
    salida.textContent = "Servicio no disponible";
    console.error("Error al consultar el tipo de cambio", error);
  }
}

const elBtnTC = document.getElementById("btnTC");
if (elBtnTC) {
  elBtnTC.addEventListener("click", consultarTipoCambio);
}

// --- Control de Navegación del Menú ---
document.addEventListener("DOMContentLoaded", () => {
  const navPedidos = document.getElementById("nav-pedidos");
  const navClientes = document.getElementById("nav-clientes");
  const navProveedores = document.getElementById("nav-proveedores");
  const navStock = document.getElementById("nav-stock");

  const secPedidos = document.getElementById("sec-pedidos");
  const secClientes = document.getElementById("sec-clientes");
  const secProveedores = document.getElementById("sec-proveedores");

  function activarModulo(navActivo, secActiva) {
    [navPedidos, navClientes, navProveedores].forEach(nav => {
      if (nav) nav.classList.remove("activo");
    });
    [secPedidos, secClientes, secProveedores].forEach(sec => {
      if (sec) sec.classList.add("oculto");
    });

    if (navActivo) navActivo.classList.add("activo");
    if (secActiva) secActiva.classList.remove("oculto");
  }

  if (navPedidos && secPedidos) {
    navPedidos.addEventListener("click", (e) => {
      e.preventDefault();
      activarModulo(navPedidos, secPedidos);
    });
  }

  if (navClientes && secClientes) {
    navClientes.addEventListener("click", (e) => {
      e.preventDefault();
      activarModulo(navClientes, secClientes);
    });
  }

  if (navProveedores && secProveedores) {
    navProveedores.addEventListener("click", (e) => {
      e.preventDefault();
      activarModulo(navProveedores, secProveedores);
    });
  }

  if (navStock) {
    navStock.addEventListener("click", (e) => {
      e.preventDefault();
    });
  }
});

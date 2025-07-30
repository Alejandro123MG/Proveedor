const apiUrl = `${window.location.origin}/Proveedor`;
let proveedorEditando = null;
let paginaActual = 1;
const elementosPorPagina = 20;
let datosOriginales = [];

function aplicarTema(tema) {
  const html = document.documentElement;
  const icon = document.getElementById("theme-icon");
  if (tema === "dark") {
    html.setAttribute("data-bs-theme", "dark");
    icon.className = "fas fa-sun text-light";
    document.body.className = "bg-dark text-light";
  } else {
    html.setAttribute("data-bs-theme", "light");
    icon.className = "fas fa-moon text-dark";
    document.body.className = "bg-light text-dark";
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-bs-theme");
  const newTheme = current === "light" ? "dark" : "light";
  localStorage.setItem("theme", newTheme);
  aplicarTema(newTheme);
}

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "light";
  aplicarTema(savedTheme);
  fetchProveedores();

  const empresaInput = document.getElementById("empresa");
  empresaInput.addEventListener("input", () => {
    if (empresaInput.value.trim() !== "") {
      empresaInput.classList.remove("input-error");
      document.getElementById("empresaError").classList.add("d-none");
    }
  });

  document.getElementById("toggleFormBtn").addEventListener("click", () => {
    resetForm();
    const modal = new bootstrap.Modal(document.getElementById("formModal"));
    modal.show();
  });

  new bootstrap.Tooltip(document.body, {
    selector: '[data-bs-toggle="tooltip"]',
    trigger: 'hover'
  });
});

function showToast(mensaje, icono = 'success') {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: icono,
    html: `<span style="font-size: 1.1rem;">${mensaje}</span>`,
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });
}

function showError(mensaje) {
  Swal.fire({ icon: 'error', title: 'Oops...', text: mensaje });
}

function mostrarDato(dato, maxLen = 50) {
  if (!dato || dato.trim().toLowerCase() === "null") {
    return `<i class="fas fa-minus-circle text-muted"></i>`;
  }
  return dato.length > maxLen
    ? `<span title="${dato}" data-bs-toggle="tooltip">${dato.substring(0, maxLen)}...</span>`
    : dato;
}

function actualizarResumen(data) {
  const total = data.length;
  const contar = campo => data.filter(p => p[campo]).length;

  document.getElementById("resumenEstadistico").innerHTML = `
    <div class="stat-card total"><i class="fas fa-users fa-2x"></i><div class="fs-4">${total}</div></div>
    <div class="stat-card facebook"><i class="fab fa-facebook fa-2x"></i><div class="fs-4">${contar('facebook')}</div></div>
    <div class="stat-card instagram"><i class="fab fa-instagram fa-2x"></i><div class="fs-4">${contar('instagram')}</div></div>
    <div class="stat-card youtube"><i class="fab fa-youtube fa-2x"></i><div class="fs-4">${contar('youtube')}</div></div>
    <div class="stat-card twitter"><i class="fab fa-twitter fa-2x"></i><div class="fs-4">${contar('twitter')}</div></div>
    <div class="stat-card linkedin"><i class="fab fa-linkedin fa-2x"></i><div class="fs-4">${contar('linkedin')}</div></div>
    <div class="stat-card sitio"><i class="fas fa-globe fa-2x"></i><div class="fs-4">${contar('sitio_web')}</div></div>`;
}

async function fetchProveedores(filtro = '', campo = 'empresa') {
  try {
    const params = new URLSearchParams();
    if (filtro) {
      params.append('filtro', filtro);
      params.append('campo', campo);
    }

    const container = document.getElementById("proveedoresContainer");
    container.innerHTML = `<div class="col-12 text-center text-muted">Cargando...</div>`;

    const res = await fetch(filtro ? `${apiUrl}?${params.toString()}` : apiUrl);
    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
    datosOriginales = await res.json();

    actualizarResumen(datosOriginales);
    paginaActual = 1; // Reset página al buscar
    mostrarPagina();

  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    showError("No se pudo conectar con el servidor.");
  }
}
function mostrarPagina() {
  const container = document.getElementById("proveedoresContainer");
  const totalElementos = datosOriginales.length;
  
  if (totalElementos === 0) {
    container.innerHTML = `<div class="col-12 text-center text-muted"><i class="fas fa-info-circle"></i> No se encontraron resultados.</div>`;
    document.getElementById("paginationInfo").textContent = "";
    document.getElementById("paginationControls").innerHTML = "";
    return;
  }

  const inicio = (paginaActual - 1) * elementosPorPagina;
  const fin = inicio + elementosPorPagina;
  const elementosPagina = datosOriginales.slice(inicio, fin);

  container.innerHTML = '';
  elementosPagina.forEach(p => {
    container.innerHTML += crearTarjetaProveedor(p);
  });

  actualizarPaginacion(totalElementos);
  
  // Reinicializar tooltips
  bootstrap.Tooltip.getInstance(document.body)?.dispose?.();
  new bootstrap.Tooltip(document.body, {
    selector: '[data-bs-toggle="tooltip"]',
    trigger: 'hover'
  });
}

function crearTarjetaProveedor(p) {
  const redesSociales = [
    { campo: 'facebook', icon: 'fab fa-facebook', color: '#1877F2', nombre: 'Facebook' },
    { campo: 'instagram', icon: 'fab fa-instagram', color: '#E1306C', nombre: 'Instagram' },
    { campo: 'youtube', icon: 'fab fa-youtube', color: '#FF0000', nombre: 'YouTube' },
    { campo: 'twitter', icon: 'fab fa-twitter', color: '#1DA1F2', nombre: 'Twitter' },
    { campo: 'linkedin', icon: 'fab fa-linkedin', color: '#0077B5', nombre: 'LinkedIn' }
  ].filter(red => p[red.campo]);

  return `
    <div class="col-lg-4 col-md-6">
      <div class="card h-100 proveedor-card">
        <div class="card-header bg-primary text-white">
          <h5 class="card-title mb-0">${p.empresa}</h5>
        </div>
        <div class="card-body d-flex flex-column">
          ${p.direccion ? `<p class="card-text"><i class="fas fa-map-marker-alt text-primary"></i> ${p.direccion}</p>` : ''}
          ${p.contacto ? `<p class="card-text"><i class="fas fa-user text-info"></i> ${p.contacto}</p>` : ''}
          ${p.correo ? `<p class="card-text"><i class="fas fa-envelope text-success"></i> <a href="mailto:${p.correo}">${p.correo}</a></p>` : ''}
          ${p.telefono ? `<p class="card-text"><i class="fas fa-phone text-warning"></i> ${p.telefono}</p>` : ''}
          ${p.sitio_web ? `<p class="card-text"><i class="fas fa-globe text-info"></i> <a href="${p.sitio_web}" target="_blank">Sitio Web</a></p>` : ''}
          ${p.descripcion ? `<p class="card-text text-muted">${p.descripcion}</p>` : ''}
          
          ${redesSociales.length > 0 ? `
            <div class="mb-3">
              <strong class="text-muted">Redes Sociales:</strong><br>
              ${redesSociales.map(red => 
                `<a href="${p[red.campo]}" target="_blank" class="me-2" title="${red.nombre}" data-bs-toggle="tooltip">
                  <i class="${red.icon}" style="color:${red.color}; font-size: 1.5rem;"></i>
                </a>`
              ).join('')}
            </div>
          ` : ''}
          
          <div class="mt-auto d-flex justify-content-end gap-2">
            <button class="btn btn-warning btn-sm" onclick='editProveedor(${JSON.stringify(p)})' title="Editar" data-bs-toggle="tooltip">
              <i class="fas fa-pen"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteProveedor('${p.empresa}')" title="Eliminar" data-bs-toggle="tooltip">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function actualizarPaginacion(totalElementos) {
  const totalPaginas = Math.ceil(totalElementos / elementosPorPagina);
  const inicio = (paginaActual - 1) * elementosPorPagina + 1;
  const fin = Math.min(paginaActual * elementosPorPagina, totalElementos);
  
  document.getElementById("paginationInfo").textContent = 
    `Mostrando ${inicio}-${fin} de ${totalElementos} proveedores`;
  
  const paginationControls = document.getElementById("paginationControls");
  
  if (totalPaginas <= 1) {
    paginationControls.innerHTML = "";
    return;
  }
  
  let html = `
    <li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual - 1})">Anterior</a>
    </li>
  `;
  
  for (let i = 1; i <= totalPaginas; i++) {
    if (i === 1 || i === totalPaginas || (i >= paginaActual - 2 && i <= paginaActual + 2)) {
      html += `
        <li class="page-item ${i === paginaActual ? 'active' : ''}">
          <a class="page-link" href="#" onclick="cambiarPagina(${i})">${i}</a>
        </li>
      `;
    } else if (i === paginaActual - 3 || i === paginaActual + 3) {
      html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
  }
  
  html += `
    <li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual + 1})">Siguiente</a>
    </li>
  `;
  
  paginationControls.innerHTML = html;
}

function cambiarPagina(nuevaPagina) {
  const totalPaginas = Math.ceil(datosOriginales.length / elementosPorPagina);
  if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
    paginaActual = nuevaPagina;
    mostrarPagina();
  }
}
function editProveedor(p) {
  proveedorEditando = p.empresa;
  for (const key in p) {
    if (document.getElementById(key)) {
      document.getElementById(key).value = p[key];
    }
  }
  document.getElementById("empresa").disabled = true;
  const modal = new bootstrap.Modal(document.getElementById("formModal"));
  modal.show();
}

function resetForm() {
  proveedorEditando = null;
  document.getElementById("proveedorForm").reset();
  const empresaInput = document.getElementById("empresa");
  empresaInput.disabled = false;
  empresaInput.classList.remove("input-error");
  document.getElementById("empresaError").classList.add("d-none");
}

function deleteProveedor(nombreEmpresa) {
  Swal.fire({
    title: `¿Eliminar proveedor "${nombreEmpresa}"?`,
    text: "No podrás deshacer esta acción",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`${apiUrl}/${encodeURIComponent(nombreEmpresa)}`, { method: 'DELETE' })
        .then(() => {
          fetchProveedores(document.getElementById("buscar").value.trim(), document.getElementById("campo").value);
          showToast("🗑️ Proveedor eliminado correctamente");
        })
        .catch(err => showError("Error al eliminar proveedor: " + err));
    }
  });
}

function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

document.getElementById("proveedorForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const empresaInput = document.getElementById("empresa");

  if (!proveedorEditando && empresaInput.value.trim() === "") {
    empresaInput.classList.add("input-error");
    document.getElementById("empresaError").classList.remove("d-none");
    empresaInput.focus();
    return;
  }

  const proveedor = {};
  ["empresa", "direccion", "contacto", "correo", "telefono", "sitio_web", "facebook", "instagram", "youtube", "twitter", "linkedin", "descripcion"]
    .forEach(id => proveedor[id] = document.getElementById(id).value);

  const method = proveedorEditando ? 'PUT' : 'POST';
  const url = proveedorEditando ? `${apiUrl}/${encodeURIComponent(proveedorEditando)}` : apiUrl;

  fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(proveedor)
  })
    .then(res => {
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      return res.json();
    })
    .then(() => {
      const fueEdicion = !!proveedorEditando;
      resetForm();
      bootstrap.Modal.getInstance(document.getElementById("formModal")).hide();
      fetchProveedores(document.getElementById("buscar").value.trim(), document.getElementById("campo").value);
      showToast(fueEdicion ? "✏️ Proveedor actualizado correctamente" : "✅ Proveedor agregado correctamente");
    })
    .catch(err => showError("Error al guardar proveedor: " + err));
});

document.getElementById("buscar").addEventListener("input", debounce(function () {
  fetchProveedores(this.value.trim(), document.getElementById("campo").value);
}, 300));

document.getElementById("campo").addEventListener("change", () => {
  fetchProveedores(document.getElementById("buscar").value.trim(), document.getElementById("campo").value);
});

document.getElementById("clearSearch").addEventListener("click", () => {
  document.getElementById("buscar").value = '';
  fetchProveedores('', document.getElementById("campo").value);
});

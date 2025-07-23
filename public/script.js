const apiUrl = `${window.location.origin}/Proveedor`;
let proveedorEditando = null;

// Tema claro/oscuro
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
  const html = document.documentElement;
  const current = html.getAttribute("data-bs-theme");
  const newTheme = current === "light" ? "dark" : "light";
  localStorage.setItem("theme", newTheme);
  aplicarTema(newTheme);
}

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "light";
  aplicarTema(savedTheme);
  fetchProveedores();
});

// 🔔 Notificaciones con SweetAlert2
function showToast(mensaje, icono = 'success') {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: icono,
    title: mensaje,
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true
  });
}

function showError(mensaje) {
  Swal.fire({
    icon: 'error',
    title: 'Oops...',
    text: mensaje
  });
}

// Resumen estadístico
function actualizarResumen(data) {
  const total = data.length;
  const conWeb = data.filter(p => p.sitio_web).length;
  const conFB = data.filter(p => p.facebook).length;
  const conIG = data.filter(p => p.instagram).length;
  const conYT = data.filter(p => p.youtube).length;
  const conTW = data.filter(p => p.twitter).length;
  const conIN = data.filter(p => p.linkedin).length;

  document.getElementById("resumenEstadistico").innerHTML = `
    <div class="stat-card total"><i class="fas fa-users fa-2x"></i><div class="fs-4">${total}</div></div>
    <div class="stat-card facebook"><i class="fab fa-facebook fa-2x"></i><div class="fs-4">${conFB}</div></div>
    <div class="stat-card instagram"><i class="fab fa-instagram fa-2x"></i><div class="fs-4">${conIG}</div></div>
    <div class="stat-card youtube"><i class="fab fa-youtube fa-2x"></i><div class="fs-4">${conYT}</div></div>
    <div class="stat-card twitter"><i class="fab fa-twitter fa-2x"></i><div class="fs-4">${conTW}</div></div>
    <div class="stat-card linkedin"><i class="fab fa-linkedin fa-2x"></i><div class="fs-4">${conIN}</div></div>
    <div class="stat-card sitio"><i class="fas fa-globe fa-2x"></i><div class="fs-4">${conWeb}</div></div>`;
}

// Obtener proveedores
async function fetchProveedores(filtro = '', campo = 'empresa') {
  try {
    const params = new URLSearchParams();
    if (filtro) {
      params.append('filtro', filtro);
      params.append('campo', campo);
    }

    const tbody = document.getElementById("proveedoresTableBody");

    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center text-muted">Cargando...</td>
      </tr>
    `;

    const res = await fetch(filtro ? `${apiUrl}?${params.toString()}` : apiUrl);
    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
    const data = await res.json();

    actualizarResumen(data);
    tbody.innerHTML = '';

    if (data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center text-muted">
            <i class="fas fa-info-circle"></i> No se encontraron resultados.
          </td>
        </tr>
      `;
      return;
    }

    data.forEach(p => {
      tbody.innerHTML += `
      <tr>
        <td>${p.empresa}</td>
        <td>${p.direccion}</td>
        <td>${p.correo}</td>
        <td>${p.telefono}</td>
        <td><a href="${p.sitio_web}" target="_blank">${p.sitio_web}</a></td>
        <td>
          ${p.facebook ? `<a href="${p.facebook}" target="_blank"><i class="fab fa-facebook" style="color:#1877F2;"></i></a>` : ''}
          ${p.instagram ? `<a href="${p.instagram}" target="_blank"><i class="fab fa-instagram" style="color:#E1306C;"></i></a>` : ''}
          ${p.youtube ? `<a href="${p.youtube}" target="_blank"><i class="fab fa-youtube" style="color:#FF0000;"></i></a>` : ''}
          ${p.twitter ? `<a href="${p.twitter}" target="_blank"><i class="fab fa-twitter" style="color:#1DA1F2;"></i></a>` : ''}
          ${p.linkedin ? `<a href="${p.linkedin}" target="_blank"><i class="fab fa-linkedin" style="color:#0077B5;"></i></a>` : ''}
        </td>
        <td>${p.descripcion}</td>
        <td>
          <div class="d-flex justify-content-center gap-2">
            <button class="btn btn-warning btn-icon btn-sm" onclick='editProveedor(${JSON.stringify(p)})' title="Editar">
              <i class="fas fa-pen"></i>
            </button>
            <button class="btn btn-danger btn-icon btn-sm" onclick="deleteProveedor('${p.empresa}')" title="Eliminar">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>`;
    });
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    showError("No se pudo conectar con el servidor.");
  }
}

// Editar proveedor
function editProveedor(p) {
  proveedorEditando = p.empresa;
  document.getElementById("empresa").value = p.empresa;
  document.getElementById("direccion").value = p.direccion;
  document.getElementById("contacto").value = p.contacto;
  document.getElementById("correo").value = p.correo;
  document.getElementById("telefono").value = p.telefono;
  document.getElementById("sitio_web").value = p.sitio_web;
  document.getElementById("facebook").value = p.facebook;
  document.getElementById("instagram").value = p.instagram;
  document.getElementById("youtube").value = p.youtube;
  document.getElementById("twitter").value = p.twitter;
  document.getElementById("linkedin").value = p.linkedin;
  document.getElementById("descripcion").value = p.descripcion;
}

// Reset form
function resetForm() {
  proveedorEditando = null;
  document.getElementById("proveedorForm").reset();
}

// Eliminar proveedor con confirmación
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
          const filtro = document.getElementById("buscar").value.trim();
          const campo = document.getElementById("campo").value;
          fetchProveedores(filtro, campo);
          showToast("Proveedor eliminado correctamente", "success");
        })
        .catch(err => showError("Error al eliminar proveedor: " + err));
    }
  });
}

// debounce para búsqueda
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// Guardar proveedor con modal de éxito
document.getElementById("proveedorForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const proveedor = {
    empresa: document.getElementById("empresa").value,
    direccion: document.getElementById("direccion").value,
    contacto: document.getElementById("contacto").value,
    correo: document.getElementById("correo").value,
    telefono: document.getElementById("telefono").value,
    sitio_web: document.getElementById("sitio_web").value,
    facebook: document.getElementById("facebook").value,
    instagram: document.getElementById("instagram").value,
    youtube: document.getElementById("youtube").value,
    twitter: document.getElementById("twitter").value,
    linkedin: document.getElementById("linkedin").value,
    descripcion: document.getElementById("descripcion").value
  };
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
    resetForm();
    const filtro = document.getElementById("buscar").value.trim();
    const campo = document.getElementById("campo").value;
    fetchProveedores(filtro, campo);

    const mensaje = proveedorEditando
      ? "Proveedor actualizado correctamente"
      : "Proveedor agregado correctamente";

    Swal.fire({
      icon: 'success',
      title: '¡Éxito!',
      text: mensaje,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'OK'
    });
  })
  .catch(err => showError("Error al guardar proveedor: " + err));
});

// Búsqueda en tiempo real
document.getElementById("buscar").addEventListener(
  "input",
  debounce(function () {
    const campo = document.getElementById("campo").value;
    fetchProveedores(this.value.trim(), campo);
  }, 300)
);

document.getElementById("campo").addEventListener("change", () => {
  const campo = document.getElementById("campo").value;
  const filtro = document.getElementById("buscar").value.trim();
  fetchProveedores(filtro, campo);
});

// Limpiar búsqueda
document.getElementById("clearSearch").addEventListener("click", () => {
  document.getElementById("buscar").value = '';
  const campo = document.getElementById("campo").value;
  fetchProveedores('', campo);
});

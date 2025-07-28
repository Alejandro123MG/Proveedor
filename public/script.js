const apiUrl = `${window.location.origin}/Proveedor`;
let proveedorEditando = null;

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

    const tbody = document.getElementById("proveedoresTableBody");
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">Cargando...</td></tr>`;

    const res = await fetch(filtro ? `${apiUrl}?${params.toString()}` : apiUrl);
    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
    const data = await res.json();

    actualizarResumen(data);
    tbody.innerHTML = '';

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted"><i class="fas fa-info-circle"></i> No se encontraron resultados.</td></tr>`;
      return;
    }

    data.forEach(p => {
      tbody.innerHTML += `
      <tr>
        <td>${mostrarDato(p.empresa)}</td>
        <td>${mostrarDato(p.direccion)}</td>
        <td>${p.correo ? `<a href="mailto:${p.correo}" title="Enviar correo" data-bs-toggle="tooltip">${p.correo}</a>` : mostrarDato(null)}</td>
        <td>${mostrarDato(p.telefono)}</td>
        <td>${p.sitio_web ? `<a href="${p.sitio_web}" target="_blank" title="${p.sitio_web}" data-bs-toggle="tooltip">${p.sitio_web}</a>` : mostrarDato(null)}</td>
        <td>
          ${p.facebook ? `<a href="${p.facebook}" target="_blank" title="Facebook" data-bs-toggle="tooltip"><i class="fab fa-facebook" style="color:#1877F2;"></i></a> ` : ''}
          ${p.instagram ? `<a href="${p.instagram}" target="_blank" title="Instagram" data-bs-toggle="tooltip"><i class="fab fa-instagram" style="color:#E1306C;"></i></a> ` : ''}
          ${p.youtube ? `<a href="${p.youtube}" target="_blank" title="YouTube" data-bs-toggle="tooltip"><i class="fab fa-youtube" style="color:#FF0000;"></i></a> ` : ''}
          ${p.twitter ? `<a href="${p.twitter}" target="_blank" title="Twitter" data-bs-toggle="tooltip"><i class="fab fa-twitter" style="color:#1DA1F2;"></i></a> ` : ''}
          ${p.linkedin ? `<a href="${p.linkedin}" target="_blank" title="LinkedIn" data-bs-toggle="tooltip"><i class="fab fa-linkedin" style="color:#0077B5;"></i></a>` : ''}
        </td>
        <td>${mostrarDato(p.descripcion)}</td>
        <td>
          <div class="d-flex justify-content-center gap-2">
            <button class="btn btn-warning btn-icon btn-sm" onclick='editProveedor(${JSON.stringify(p)})' title="Editar proveedor" data-bs-toggle="tooltip">
              <i class="fas fa-pen"></i>
            </button>
            <button class="btn btn-danger btn-icon btn-sm" onclick="deleteProveedor('${p.empresa}')" title="Eliminar proveedor" data-bs-toggle="tooltip">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>`;
    });

    bootstrap.Tooltip.getInstance(document.body)?.dispose?.();
    new bootstrap.Tooltip(document.body, {
      selector: '[data-bs-toggle="tooltip"]',
      trigger: 'hover'
    });

  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    showError("No se pudo conectar con el servidor.");
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

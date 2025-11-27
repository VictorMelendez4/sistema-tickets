import { useEffect, useState } from "react";
import { api } from "../api/axios";

export default function Docentes() {
  const [docentes, setDocentes] = useState([]);

  // NOTA: specialtyText es un string que luego convertimos a arreglo
  const [formDocente, setFormDocente] = useState({
    firstName: "",
    lastName: "",
    employeeId: "",
    emailInst: "",
    specialtyText: "",
  });

  const [editando, setEditando] = useState(false);
  const [docenteIdEditando, setDocenteIdEditando] = useState(null);

  // ===== Cargar docentes =====
  async function cargarDocentes() {
    const { data } = await api.get("/teachers");
    setDocentes(data);
  }

  useEffect(() => {
    cargarDocentes().catch(console.error);
  }, []);

  // ===== Formulario =====
  function manejarCambio(e) {
    const { name, value } = e.target;
    setFormDocente((prev) => ({ ...prev, [name]: value }));
  }

  function limpiarFormulario() {
    setFormDocente({
      firstName: "",
      lastName: "",
      employeeId: "",
      emailInst: "",
      specialtyText: "",
    });
    setEditando(false);
    setDocenteIdEditando(null);
  }

  function construirPayload() {
    const specialties =
      formDocente.specialtyText
        ?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [];

    return {
      firstName: formDocente.firstName,
      lastName: formDocente.lastName,
      employeeId: formDocente.employeeId,
      emailInst: formDocente.emailInst,
      specialty: specialties, // 👈 coincide con el modelo
    };
  }

  async function manejarSubmit(e) {
    e.preventDefault();

    const payload = construirPayload();

    try {
      if (editando && docenteIdEditando) {
        // EDITAR
        await api.put(`/teachers/${docenteIdEditando}`, payload);
        alert("Docente actualizado correctamente");
      } else {
        // CREAR
        await api.post("/teachers", payload);
        alert("Docente registrado correctamente");
      }

      await cargarDocentes();
      limpiarFormulario();
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.msg ||
        "Error creando docente (revisa que no se repita el employeeId y que todos los campos obligatorios estén llenos)";
      alert(msg);
    }
  }

  function manejarEditar(docente) {
    setFormDocente({
      firstName: docente.firstName || "",
      lastName: docente.lastName || "",
      employeeId: docente.employeeId || "",
      emailInst: docente.emailInst || "",
      specialtyText: (docente.specialty || []).join(", "),
    });
    setEditando(true);
    setDocenteIdEditando(docente._id);
  }

  async function manejarEliminar(id) {
    const ok = window.confirm("¿Seguro que quieres eliminar este docente?");
    if (!ok) return;

    try {
      await api.delete(`/teachers/${id}`);
      await cargarDocentes();
      alert("Docente eliminado");

      if (editando && docenteIdEditando === id) {
        limpiarFormulario();
      }
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.msg || "Error al eliminar al docente";
      alert(msg);
    }
  }

  return (
    <div className="p-3">
      <h2>Docentes</h2>

      {/* Formulario */}
      <div className="card mt-3 mb-4">
        <div className="card-body">
          <h5 className="card-title">
            {editando ? "Editar docente" : "Registrar nuevo docente"}
          </h5>

          <form className="row g-3" onSubmit={manejarSubmit}>
            <div className="col-md-4">
              <label className="form-label">Nombre(s)</label>
              <input
                type="text"
                className="form-control"
                name="firstName"
                value={formDocente.firstName}
                onChange={manejarCambio}
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Apellidos</label>
              <input
                type="text"
                className="form-control"
                name="lastName"
                value={formDocente.lastName}
                onChange={manejarCambio}
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">ID de empleado</label>
              <input
                type="text"
                className="form-control"
                name="employeeId"
                placeholder="Ej. DOC001"
                value={formDocente.employeeId}
                onChange={manejarCambio}
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Correo institucional</label>
              <input
                type="email"
                className="form-control"
                name="emailInst"
                value={formDocente.emailInst}
                onChange={manejarCambio}
              />
            </div>

            <div className="col-md-8">
              <label className="form-label">
                Especialidades (separadas por coma)
              </label>
              <input
                type="text"
                className="form-control"
                name="specialtyText"
                placeholder="Ej. Matemáticas, Física"
                value={formDocente.specialtyText}
                onChange={manejarCambio}
              />
            </div>

            <div className="col-12 d-flex gap-2">
              <button type="submit" className="btn btn-primary">
                {editando ? "Actualizar docente" : "Guardar docente"}
              </button>

              {editando && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={limpiarFormulario}
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Tabla */}
      <table className="table mt-3">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Employee ID</th>
            <th>Correo inst.</th>
            <th>Especialidades</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {docentes.map((d) => (
            <tr key={d._id}>
              <td>
                {d.firstName} {d.lastName}
              </td>
              <td>{d.employeeId}</td>
              <td>{d.emailInst}</td>
              <td>{(d.specialty || []).join(", ")}</td>
              <td>
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => manejarEditar(d)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => manejarEliminar(d._id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}

          {docentes.length === 0 && (
            <tr>
              <td colSpan={5} className="text-muted">
                No hay docentes registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

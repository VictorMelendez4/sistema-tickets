import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { Link } from "react-router-dom";

export default function Alumnos() {
  const [alumnos, setAlumnos] = useState([]);

  // Estado del formulario
  const [formAlumno, setFormAlumno] = useState({
    firstName: "",
    lastName: "",
    curpOrId: "",
    emailAcad: "",
    phone: "",
    status: "REGULAR",
  });

  const [editando, setEditando] = useState(false);
  const [alumnoIdEditando, setAlumnoIdEditando] = useState(null);

  async function cargarAlumnos() {
    const { data } = await api.get("/students");
    setAlumnos(data);
  }

  useEffect(() => {
    cargarAlumnos();
  }, []);

  function manejarCambio(e) {
    const { name, value } = e.target;
    setFormAlumno((prev) => ({ ...prev, [name]: value }));
  }

  function limpiarFormulario() {
    setFormAlumno({
      firstName: "",
      lastName: "",
      curpOrId: "",
      emailAcad: "",
      phone: "",
      status: "REGULAR",
    });
    setEditando(false);
    setAlumnoIdEditando(null);
  }

  async function manejarSubmit(e) {
    e.preventDefault();

    try {
      if (editando && alumnoIdEditando) {
        // ----------- EDITAR alumno------------------------
        await api.put(`/students/${alumnoIdEditando}`, formAlumno);
        alert("Alumno actualizado correctamente");
      } else {
        // ----------- CREAR alumno-------------------------
        await api.post("/students", formAlumno);
        alert("Alumno registrado correctamente");
      }

      await cargarAlumnos();
      limpiarFormulario();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.msg || "Error al guardar alumno";
      alert(msg);
    }
  }

  function manejarEditar(alumno) {
    setFormAlumno({
      firstName: alumno.firstName || "",
      lastName: alumno.lastName || "",
      curpOrId: alumno.curpOrId || "",
      emailAcad: alumno.emailAcad || "",
      phone: alumno.phone || "",
      status: alumno.status || "REGULAR",
    });
    setEditando(true);
    setAlumnoIdEditando(alumno._id);
  }

  async function manejarEliminar(id) {
    const ok = window.confirm("¿Seguro que quieres eliminar este alumno?");
    if (!ok) return;

    try {
      await api.delete(`/students/${id}`);
      await cargarAlumnos();
      alert("Alumno eliminado");
      // Si estabas editando este alumno, limpia el form
      if (editando && alumnoIdEditando === id) {
        limpiarFormulario();
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.msg || "Error al eliminar alumno";
      alert(msg);
    }
  }

  return (
    <div className="p-3">
      <h2>Alumnos</h2>

      {/* Formulario */}
      <div className="card mt-3 mb-4">
        <div className="card-body">
          <h5 className="card-title">
            {editando ? "Editar alumno" : "Registrar nuevo alumno"}
          </h5>

          <form className="row g-3" onSubmit={manejarSubmit}>
            <div className="col-md-4">
              <label className="form-label">Nombre(s)</label>
              <input
                type="text"
                className="form-control"
                name="firstName"
                value={formAlumno.firstName}
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
                value={formAlumno.lastName}
                onChange={manejarCambio}
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Matrícula / ID</label>
              <input
                type="text"
                className="form-control"
                name="curpOrId"
                value={formAlumno.curpOrId}
                onChange={manejarCambio}
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Correo académico</label>
              <input
                type="email"
                className="form-control"
                name="emailAcad"
                value={formAlumno.emailAcad}
                onChange={manejarCambio}
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Teléfono</label>
              <input
                type="tel"
                className="form-control"
                name="phone"
                value={formAlumno.phone}
                onChange={manejarCambio}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Estatus</label>
              <select
                className="form-select"
                name="status"
                value={formAlumno.status}
                onChange={manejarCambio}
              >
              <option value="REGULAR">REGULAR</option>
              <option value="BAJA">BAJA</option>
              <option value="EGRESADO">EGRESADO</option>
              </select>
            </div>

            <div className="col-12 d-flex gap-2">
              <button type="submit" className="btn btn-primary">
                {editando ? "Actualizar alumno" : "Guardar alumno"}
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
            <th>Matrícula</th>
            <th>Correo académico</th>
            <th>Teléfono</th>
            <th>Estatus</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {alumnos.map((a) => (
            <tr key={a._id}>
              <td>
                {a.firstName} {a.lastName}
              </td>
              <td>{a.curpOrId}</td>
              <td>{a.emailAcad}</td>
              <td>{a.phone}</td>
              <td>{a.status}</td>
              <td>
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => manejarEditar(a)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => manejarEliminar(a._id)}
                >
                  Eliminar
                </button>
              <Link to={`/alumnos/${a._id}/historial`}
        className="btn btn-sm btn-info text-white"
  >
    Historial
  </Link>

              </td>
            </tr>
          ))}
          {alumnos.length === 0 && (
            <tr>
              <td colSpan="6" className="text-muted">
                No hay alumnos registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

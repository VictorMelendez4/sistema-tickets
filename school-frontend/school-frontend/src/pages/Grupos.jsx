import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { Link } from "react-router-dom";


export default function Grupos() {
  const [grupos, setGrupos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [docentes, setDocentes] = useState([]);

  const [formGrupo, setFormGrupo] = useState({
    name: "",
    course: "",
    teacher: "",
    term: "",
    capacity: "",
    status: "ACTIVO",
  });

  const [editando, setEditando] = useState(false);
  const [grupoIdEditando, setGrupoIdEditando] = useState(null);

  // ========== CARGA INICIAL ==========
  async function cargarGrupos() {
    const { data } = await api.get("/groups");
    setGrupos(data);
  }

  async function cargarCursosYDocentes() {
    const [resCursos, resDocentes] = await Promise.all([
      api.get("/courses"),
      api.get("/teachers"),
    ]);

    setCursos(resCursos.data);
    setDocentes(resDocentes.data);
  }

  useEffect(() => {
    cargarGrupos().catch(console.error);
    cargarCursosYDocentes().catch(console.error);
  }, []);

  // ========== FORMULARIO ==========

  function manejarCambio(e) {
    const { name, value } = e.target;
    setFormGrupo((prev) => ({ ...prev, [name]: value }));
  }

  function limpiarFormulario() {
    setFormGrupo({
      name: "",
      course: "",
      teacher: "",
      term: "",
      capacity: "",
      status: "ACTIVO",
    });
    setEditando(false);
    setGrupoIdEditando(null);
  }

  async function manejarSubmit(e) {
    e.preventDefault();

    try {
      const payload = {
        name: formGrupo.name,
        course: formGrupo.course,
        teacher: formGrupo.teacher,
        term: formGrupo.term,
        status: formGrupo.status,
      };

      // capacity es opcional, por si tu schema lo tiene
      if (formGrupo.capacity !== "") {
        payload.capacity = Number(formGrupo.capacity);
      }

      if (editando && grupoIdEditando) {
        await api.put(`/groups/${grupoIdEditando}`, payload);
        alert("Grupo actualizado correctamente");
      } else {
        await api.post("/groups", payload);
        alert("Grupo registrado correctamente");
      }

      await cargarGrupos();
      limpiarFormulario();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.msg || "Error al guardar grupo";
      alert(msg);
    }
  }

  function manejarEditar(grupo) {
    setFormGrupo({
      name: grupo.name || "",
      course: grupo.course?._id || "",
      teacher: grupo.teacher?._id || "",
      term: grupo.term || "",
      capacity: grupo.capacity ?? "",
      status: grupo.status || "ACTIVO",
    });
    setEditando(true);
    setGrupoIdEditando(grupo._id);
  }

  async function manejarEliminar(id) {
    const ok = window.confirm("¿Seguro que quieres eliminar este grupo?");
    if (!ok) return;

    try {
      await api.delete(`/groups/${id}`);
      await cargarGrupos();
      alert("Grupo eliminado");

      if (editando && grupoIdEditando === id) {
        limpiarFormulario();
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.msg || "Error al eliminar grupo";
      alert(msg);
    }
  }

  return (
    <div className="p-3">
      <h2>Grupos</h2>

      {/* -------- Formulario -------- */}
      <div className="card mt-3 mb-4">
        <div className="card-body">
          <h5 className="card-title">
            {editando ? "Editar grupo" : "Registrar nuevo grupo"}
          </h5>

          <form className="row g-3" onSubmit={manejarSubmit}>
            <div className="col-md-4">
              <label className="form-label">Nombre / Clave del grupo</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formGrupo.name}
                onChange={manejarCambio}
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Curso</label>
              <select
                className="form-select"
                name="course"
                value={formGrupo.course}
                onChange={manejarCambio}
                required
              >
                <option value="">-- Selecciona un curso --</option>
                {cursos.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Docente</label>
              <select
                className="form-select"
                name="teacher"
                value={formGrupo.teacher}
                onChange={manejarCambio}
                required
              >
                <option value="">-- Selecciona un docente --</option>
                {docentes.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.firstName} {t.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Periodo</label>
              <input
                type="text"
                className="form-control"
                name="term"
                placeholder="Ej. 2025-1 o Ago–Dic 2025"
                value={formGrupo.term}
                onChange={manejarCambio}
                required
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Cupo máximo (opcional)</label>
              <input
                type="number"
                className="form-control"
                name="capacity"
                value={formGrupo.capacity}
                onChange={manejarCambio}
                min="0"
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Estado</label>
              <select
                className="form-select"
                name="status"
                value={formGrupo.status}
                onChange={manejarCambio}
              >
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
              </select>
            </div>

            <div className="col-12 d-flex gap-2">
              <button type="submit" className="btn btn-primary">
                {editando ? "Actualizar grupo" : "Guardar grupo"}
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

      {/* -------- Tabla -------- */}
      <table className="table mt-3">
        <thead>
          <tr>
            <th>Grupo</th>
            <th>Curso</th>
            <th>Docente</th>
            <th>Periodo</th>
            <th>Estado</th>
            <th>Cupo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {grupos.map((g) => (
            <tr key={g._id}>
              <td>{g.name}</td>
              <td>{g.course?.name}</td>
              <td>
                {g.teacher
                  ? `${g.teacher.firstName} ${g.teacher.lastName}`
                  : "(sin docente)"}
              </td>
              <td>{g.term}</td>
              <td>{g.status || "ACTIVO"}</td>
              <td>{g.capacity ?? "-"}</td>
              <td>
  <button
    className="btn btn-sm btn-outline-primary me-2"
    onClick={() => manejarEditar(g)}
  >
    Editar
  </button>

  <button
    className="btn btn-sm btn-outline-danger me-2"
    onClick={() => manejarEliminar(g._id)}
  >
    Eliminar
  </button>

  <Link
    to={`/grupos/${g._id}/reporte`}
    className="btn btn-sm btn-info text-white"
  >
    Reporte
  </Link>
</td>

            </tr>
          ))}

          {grupos.length === 0 && (
            <tr>
              <td colSpan={7} className="text-muted">
                No hay grupos registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

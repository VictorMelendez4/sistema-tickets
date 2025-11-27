import { useEffect, useState } from "react";
import { api } from "../api/axios";

export default function Cursos() {
  const [cursos, setCursos] = useState([]);

  const [formCurso, setFormCurso] = useState({
    code: "",
    name: "",
    credits: "",
    hoursWeek: "",
  });

  const [editando, setEditando] = useState(false);
  const [cursoIdEditando, setCursoIdEditando] = useState(null);

  async function cargarCursos() {
    const { data } = await api.get("/courses");
    setCursos(data);
  }

  useEffect(() => {
    cargarCursos();
  }, []);

  function manejarCambio(e) {
    const { name, value } = e.target;
    setFormCurso((prev) => ({ ...prev, [name]: value }));
  }

  function limpiarFormulario() {
    setFormCurso({
      code: "",
      name: "",
      credits: "",
      hoursWeek: "",
    });
    setEditando(false);
    setCursoIdEditando(null);
  }

  async function manejarSubmit(e) {
    e.preventDefault();

    try {
      if (editando && cursoIdEditando) {
        await api.put(`/courses/${cursoIdEditando}`, {
          ...formCurso,
          credits: Number(formCurso.credits),
          hoursWeek: Number(formCurso.hoursWeek),
        });
        alert("Curso actualizado correctamente");
      } else {
        await api.post("/courses", {
          ...formCurso,
          credits: Number(formCurso.credits),
          hoursWeek: Number(formCurso.hoursWeek),
        });
        alert("Curso registrado correctamente");
      }

      await cargarCursos();
      limpiarFormulario();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.msg || "Error al guardar curso";
      alert(msg);
    }
  }

  function manejarEditar(cur) {
    setFormCurso({
      code: cur.code,
      name: cur.name,
      credits: cur.credits,
      hoursWeek: cur.hoursWeek,
    });
    setEditando(true);
    setCursoIdEditando(cur._id);
  }

  async function manejarEliminar(id) {
    const ok = window.confirm("¿Seguro que deseas eliminar este curso?");
    if (!ok) return;

    try {
      await api.delete(`/courses/${id}`);
      await cargarCursos();
      alert("Curso eliminado");
      if (editando && cursoIdEditando === id) limpiarFormulario();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.msg || "Error al eliminar curso";
      alert(msg);
    }
  }

  return (
    <div className="p-3">
      <h2>Cursos</h2>

      <div className="card mt-3 mb-4">
        <div className="card-body">
          <h5 className="card-title">
            {editando ? "Editar curso" : "Registrar nuevo curso"}
          </h5>

          <form className="row g-3" onSubmit={manejarSubmit}>
            <div className="col-md-3">
              <label className="form-label">Código</label>
              <input
                type="text"
                className="form-control"
                name="code"
                value={formCurso.code}
                onChange={manejarCambio}
                required
              />
            </div>

            <div className="col-md-5">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formCurso.name}
                onChange={manejarCambio}
                required
              />
            </div>

            <div className="col-md-2">
              <label className="form-label">Créditos</label>
              <input
                type="number"
                className="form-control"
                name="credits"
                value={formCurso.credits}
                onChange={manejarCambio}
                required
              />
            </div>

            <div className="col-md-2">
              <label className="form-label">Horas/semana</label>
              <input
                type="number"
                className="form-control"
                name="hoursWeek"
                value={formCurso.hoursWeek}
                onChange={manejarCambio}
                required
              />
            </div>

            <div className="col-12 d-flex gap-2">
              <button type="submit" className="btn btn-primary">
                {editando ? "Actualizar" : "Guardar"}
              </button>

              {editando && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={limpiarFormulario}
                >
                  Cancelar
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
            <th>Código</th>
            <th>Nombre</th>
            <th>Créditos</th>
            <th>Horas/Semana</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cursos.map((c) => (
            <tr key={c._id}>
              <td>{c.code}</td>
              <td>{c.name}</td>
              <td>{c.credits}</td>
              <td>{c.hoursWeek}</td>
              <td>
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => manejarEditar(c)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => manejarEliminar(c._id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
          {cursos.length === 0 && (
            <tr>
              <td colSpan={5} className="text-muted">
                No hay cursos registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

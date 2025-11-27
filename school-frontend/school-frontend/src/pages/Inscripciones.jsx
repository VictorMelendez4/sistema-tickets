import { useEffect, useState } from "react";
import { api } from "../api/axios";

export default function Inscripciones() {
  const [grupos, setGrupos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("");
  const [inscripciones, setInscripciones] = useState([]);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState("");

  // Cargar listas iniciales
  useEffect(() => {
    async function cargarDatos() {
      const [resGrupos, resAlumnos] = await Promise.all([
        api.get("/groups"),
        api.get("/students"),
      ]);
      setGrupos(resGrupos.data);
      setAlumnos(resAlumnos.data);

      if (resGrupos.data.length > 0) {
        setGrupoSeleccionado(resGrupos.data[0]._id);
      }
    }

    cargarDatos().catch((err) =>
      console.error("Error cargando datos iniciales", err)
    );
  }, []);

  // Cargar inscripciones cuando cambie el grupo seleccionado
  useEffect(() => {
    if (!grupoSeleccionado) return;

    async function cargarInscripciones() {
      const { data } = await api.get("/inscripciones", {
        params: { grupo: grupoSeleccionado },
      });
      setInscripciones(data);
    }

    cargarInscripciones().catch((err) =>
      console.error("Error cargando inscripciones", err)
    );
  }, [grupoSeleccionado]);

  async function manejarInscribir(e) {
    e.preventDefault();
    if (!alumnoSeleccionado || !grupoSeleccionado) {
      alert("Selecciona alumno y grupo");
      return;
    }

    try {
      await api.post("/inscripciones", {
        alumno: alumnoSeleccionado,
        grupo: grupoSeleccionado,
        estado: "ACTIVA",
      });

      // Recargar inscripciones del grupo
      const { data } = await api.get("/inscripciones", {
        params: { grupo: grupoSeleccionado },
      });
      setInscripciones(data);
      setAlumnoSeleccionado("");
      alert("Alumno inscrito correctamente");
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.msg || "Error al inscribir alumno en el grupo";
      alert(msg);
    }
  }

  return (
    <div className="p-3">
      <h2>Inscripciones</h2>

      {/* Filtros / Selección de grupo */}
      <div className="row mt-3">
        <div className="col-md-4">
          <label className="form-label">Grupo</label>
          <select
            className="form-select"
            value={grupoSeleccionado}
            onChange={(e) => setGrupoSeleccionado(e.target.value)}
          >
            {grupos.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name || "(sin nombre)"} — {g.course?.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de inscripciones */}
      <h5 className="mt-4">Alumnos inscritos</h5>
      <table className="table mt-2">
        <thead>
          <tr>
            <th>Alumno</th>
            <th>Correo</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {inscripciones.map((ins) => (
            <tr key={ins._id}>
              <td>
                {ins.alumno
                  ? `${ins.alumno.firstName} ${ins.alumno.lastName}`
                  : "(desconocido)"}
              </td>
              <td>{ins.alumno?.emailAcad}</td>
              <td>{ins.estado}</td>
            </tr>
          ))}
          {inscripciones.length === 0 && (
            <tr>
              <td colSpan="3" className="text-muted">
                No hay alumnos inscritos en este grupo.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Formulario para nueva inscripción */}
      <h5 className="mt-4">Inscribir alumno a este grupo</h5>
      <form className="row g-3 mt-1" onSubmit={manejarInscribir}>
        <div className="col-md-4">
          <label className="form-label">Alumno</label>
          <select
            className="form-select"
            value={alumnoSeleccionado}
            onChange={(e) => setAlumnoSeleccionado(e.target.value)}
          >
            <option value="">-- Selecciona un alumno --</option>
            {alumnos.map((a) => (
              <option key={a._id} value={a._id}>
                {a.firstName} {a.lastName} — {a.curpOrId}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-12">
          <button className="btn btn-primary" type="submit">
            Inscribir
          </button>
        </div>
      </form>
    </div>
  );
}

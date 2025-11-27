import { useEffect, useState } from "react";
import { api } from "../api/axios";

export default function Calificaciones() {
  const [grupos, setGrupos] = useState([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("");
  const [inscripciones, setInscripciones] = useState([]);
  const [calificacionActual, setCalificacionActual] = useState(null);
  const [inscSeleccionada, setInscSeleccionada] = useState("");
  const [rubros, setRubros] = useState([
    { nombre: "Parcial 1", porcentaje: 30, calificacion: "" },
    { nombre: "Parcial 2", porcentaje: 30, calificacion: "" },
    { nombre: "Examen final", porcentaje: 40, calificacion: "" }
  ]);

  //----------------> Se cargan los grupos
  useEffect(() => {
    api.get("/groups")
      .then((res) => {
        setGrupos(res.data);
        if (res.data.length > 0) {
          setGrupoSeleccionado(res.data[0]._id);
        }
      })
      .catch(console.error);
  }, []);

  //----------->  Cargar las inscripciones del grupo
  useEffect(() => {
    if (!grupoSeleccionado) return;

    api.get("/inscripciones", { params: { grupo: grupoSeleccionado } })
      .then((res) => setInscripciones(res.data))
      .catch(console.error);
  }, [grupoSeleccionado]);

  // ----------> Cargar calificación de la inscripción seleccionada
  useEffect(() => {
    if (!inscSeleccionada) {
      setCalificacionActual(null);
      return;
    }

    api.get("/calificaciones", { params: { inscripcion: inscSeleccionada } })
      .then((res) => {
        const calif = res.data[0]; // solo debería haber una por inscripción
        if (calif) {
          setCalificacionActual(calif);
          // rellenar rubros con lo que venga de la BD
          setRubros(
            calif.rubros.map((r) => ({
              nombre: r.nombre,
              porcentaje: r.porcentaje,
              calificacion: r.calificacion
            }))
          );
        } else {
          setCalificacionActual(null);
          // resetear rubros si no hay calificación aún
          setRubros([
            { nombre: "Parcial 1", porcentaje: 30, calificacion: "" },
            { nombre: "Parcial 2", porcentaje: 30, calificacion: "" },
            { nombre: "Examen final", porcentaje: 40, calificacion: "" }
          ]);
        }
      })
      .catch((err) => {
        console.error(err);
        setCalificacionActual(null);
      });
  }, [inscSeleccionada]);

  async function guardarCalificaciones(e) {
    e.preventDefault();

    try {
      const payload = {
        inscripcion: inscSeleccionada,
        rubros: rubros.map((r) => ({
          ...r,
          calificacion: Number(r.calificacion)
        }))
      };

      
      await api.post("/calificaciones", payload);

      // Volver a cargar la calificación desde el backend
      const { data } = await api.get("/calificaciones", {
        params: { inscripcion: inscSeleccionada }
      });
      const calif = data[0];
      setCalificacionActual(calif || null);

      alert("Calificaciones guardadas correctamente");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.msg || "Error guardando calificaciones";
      alert(msg);
    }
  }

  return (
    <div className="p-4">
      <h2>Calificaciones</h2>

      {/* Selección de grupo */}
      <div className="row mt-3">
        <div className="col-md-4">
          <label className="form-label">Grupo</label>
          <select
            className="form-select"
            value={grupoSeleccionado}
            onChange={(e) => {
              setGrupoSeleccionado(e.target.value);
              setInscSeleccionada("");
              setCalificacionActual(null);
            }}
          >
            {grupos.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name} — {g.course?.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de alumnos inscritos */}
      <h5 className="mt-4">Alumnos inscritos</h5>
      <table className="table">
        <thead>
          <tr>
            <th>Alumno</th>
            <th>Correo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {inscripciones.map((ins) => (
            <tr key={ins._id}>
              <td>
                {ins.alumno.firstName} {ins.alumno.lastName}
              </td>
              <td>{ins.alumno.emailAcad}</td>
              <td>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => setInscSeleccionada(ins._id)}
                >
                  Ver / registrar
                </button>
              </td>
            </tr>
          ))}
          {inscripciones.length === 0 && (
            <tr>
              <td colSpan={3} className="text-muted">
                No hay inscripciones en este grupo.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Formulario de calificaciones */}
      {inscSeleccionada && (
        <div className="mt-4">
          <h4>Calificaciones de la inscripción seleccionada</h4>
          <form className="row g-3" onSubmit={guardarCalificaciones}>
            {rubros.map((r, i) => (
              <div className="col-md-4" key={i}>
                <label className="form-label">
                  {r.nombre} ({r.porcentaje}%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-control"
                  value={r.calificacion}
                  onChange={(e) => {
                    const copia = [...rubros];
                    copia[i].calificacion = e.target.value;
                    setRubros(copia);
                  }}
                />
              </div>
            ))}

            <div className="col-12">
              <button className="btn btn-success mt-2" type="submit">
                Guardar
              </button>
            </div>
          </form>

          {/* Mostrar lo que hay en BD */}
          <h5 className="mt-4">Registro actual en BD</h5>
          {calificacionActual ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Rubro</th>
                  <th>Porcentaje</th>
                  <th>Calificación</th>
                </tr>
              </thead>
              <tbody>
                {calificacionActual.rubros.map((r, idx) => (
                  <tr key={idx}>
                    <td>{r.nombre}</td>
                    <td>{r.porcentaje}%</td>
                    <td>{r.calificacion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-muted">
              Aún no hay calificación guardada para esta inscripción.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

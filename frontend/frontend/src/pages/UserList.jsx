import { useEffect, useState } from "react";
import { api } from "../api/axios";
import toast from "react-hot-toast";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar usuarios
  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/users");
      setUsers(data);
    } catch (error) {
      toast.error("Error cargando usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Cambiar Rol
  const handleChangeRole = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}`, { role: newRole });
      toast.success("Rol actualizado");
      fetchUsers(); // Recargar lista
    } catch (error) {
      toast.error("Error al actualizar rol");
    }
  };

  // Eliminar Usuario
  const handleDelete = async (userId) => {
    if (!window.confirm("¿Seguro que quieres eliminar este usuario?")) return;
    try {
      await api.delete(`/users/${userId}`);
      toast.success("Usuario eliminado");
      fetchUsers();
    } catch (error) {
      toast.error("No se pudo eliminar");
    }
  };

  if (loading) return <div className="p-5 text-center">Cargando usuarios...</div>;

  return (
    <div className="container-fluid" style={{ maxWidth: "1200px" }}>
      <h2 className="fw-bold mb-4"><i className="bi bi-people-fill me-2"></i> Gestión de Usuarios</h2>
      
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Usuario</th>
                  <th>Email</th>
                  <th>Departamento</th>
                  <th>Rol Actual</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td className="ps-4 fw-bold">{u.firstName} {u.lastName}</td>
                    <td>{u.email}</td>
                    <td><span className="badge bg-light text-dark border">{u.department || "N/A"}</span></td>
                    <td>
                      {/* Selector de Rol */}
                      <select 
                        className={`form-select form-select-sm fw-bold ${
                            u.role === "ADMIN" ? "text-danger" : 
                            u.role === "SUPPORT" ? "text-primary" : "text-success"
                        }`}
                        value={u.role}
                        onChange={(e) => handleChangeRole(u._id, e.target.value)}
                      >
                        <option value="CLIENT">CLIENTE</option>
                        <option value="SUPPORT">SOPORTE</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleDelete(u._id)} 
                        className="btn btn-sm btn-outline-danger"
                        title="Eliminar usuario"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
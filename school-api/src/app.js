import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import studentRoutes from "./routes/student.routes.js";
import courseRoutes from "./routes/course.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import groupRoutes from "./routes/group.routes.js";
import inscripcionRoutes from "./routes/inscripcion.routes.js";
import calificacionRoutes from "./routes/calificacion.routes.js";



const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ msg: "School API OK" });
});

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/inscripciones", inscripcionRoutes);
app.use("/api/calificaciones", calificacionRoutes);


export default app;

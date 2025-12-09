import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'El contenido del comentario es obligatorio'],
    trim: true
  },
  // Referencia al Ticket al que pertenece este comentario
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  // Referencia al Usuario que escribió el comentario (Agente o Cliente)
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true // Para tener createdAt y updatedAt
});

export const Comment = mongoose.model('Comment', commentSchema);
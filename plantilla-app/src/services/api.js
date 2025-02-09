// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const getLibros = () => axios.get(`${API_URL}/libros`);
export const registrarUsuario = (usuario) =>
    axios.post(`${API_URL}/usuarios/registro`, usuario);

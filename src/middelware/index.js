// middelware.js

/**
 * Verifica si hay una sesión activa
 * @returns {boolean} True si hay una sesión activa
 */
export function isActiveSession() {
    const token = localStorage.getItem("access-token"); // Corregido de "acces-token"
    const userId = localStorage.getItem("userid");
    return !!token && !!userId;
}

/**
 * Verifica si el usuario es profesor
 * @returns {boolean} True si el usuario es profesor
 */
export function isProfesor() {
    const rol = localStorage.getItem("userrol");
    return rol === "profesor";
}

/**
 * Verifica si el usuario es administrador
 * @returns {boolean} True si el usuario es administrador
 */
export function isAdmin() {
    const rol = localStorage.getItem("userrol");
    return rol === "admin";
}

/**
 * Obtiene el tipo de usuario actual
 * @returns {string} 'admin' o 'profesor'
 */
export function getUserType() {
    const rol = localStorage.getItem("userrol");
    return rol || "profesor"; // Si no hay rol, asume profesor como valor predeterminado
}

/**
 * Función para cerrar sesión
 */
export function logout() {
    localStorage.removeItem("userid");
    localStorage.removeItem("access-token");
    localStorage.removeItem("userrol");
    localStorage.removeItem("usercorreo");
    localStorage.removeItem("usernombre");
    localStorage.removeItem("userempleado");
    localStorage.removeItem("id_informe");
    
    // Redireccionar a la página de login
    window.location.href = '/';
}
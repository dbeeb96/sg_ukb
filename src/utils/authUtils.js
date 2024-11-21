// src/utils/authUtils.js
export const logout = () => {
    localStorage.removeItem('userLoggedIn');
    window.location.href = '/login';  // Redirect to login page
};

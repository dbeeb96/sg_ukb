// src/utils/authUtils.js
export const logout = () => {
    localStorage.removeItem('userLoggedIn');
    window.location.href = '/';  // Redirect to login page
};

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterForm from './components/Register/RegisterForm';
import LoginForm from './components/Auth/LoginForm';
import AdminDashboard from './components/Admin/AdminDashboard';
import StudentDashboard from './components/Student/StudentDashboard';
import AccountantDashboard from './components/PaymentDashboard/AccountantDashboard';
import RPDashboard from './components/RP/RP-Dashboard';
import PaymentDashboard from "./components/PaymentDashboard/PaymentDashboard";

const App = () => (
    <Router>
        <Routes>
            <Route path="/" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/accountant" element={<AccountantDashboard />} />
            <Route path="/rp" element={<RPDashboard />} />
            <Route path="/payment" element={<PaymentDashboard />} />
        </Routes>
    </Router>
);

export default App;

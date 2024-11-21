export const authenticateUser = (email, password) => {
    const users = {
        "supportinformatique@ukb.sn": { password: "pass123", verified: false },
        // Add other dummy users or connect to your backend here
    };

    if (users[email] && users[email].password === password) {
        return { email, verified: users[email].verified }; // Return user data, including verification status
    } else {
        return null;
    }
};

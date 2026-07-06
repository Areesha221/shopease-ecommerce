// Login Form Handler
const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email, password: password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                alert('Login Successful! Welcome back, ' + data.user.name);
                window.location.href = 'index.html'; 
            } else {
                alert(data.message || 'Login failed. Please check your details.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Server error. Please make sure the backend is running!');
        }
    });
}

// Password Eye Toggle Logic for Login
const toggleLoginPassword = document.getElementById('toggleLoginPassword');
const loginPasswordInput = document.getElementById('password');

if (toggleLoginPassword) {
    toggleLoginPassword.addEventListener('click', () => {
        const type = loginPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        loginPasswordInput.setAttribute('type', type);
        toggleLoginPassword.classList.toggle('fa-eye-slash');
    });
}
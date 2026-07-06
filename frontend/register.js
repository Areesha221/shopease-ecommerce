const registerForm = document.getElementById('register-form');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Grab values using the EXACT IDs from your HTML
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // 2. Check if both passwords match
        if (password !== confirmPassword) {
            alert('Passwords do not match! Please try again.');
            return;
        }

        // 3. Check if password is at least 6 characters
        if (password.length < 6) {
            alert('Password must be at least 6 characters long.');
            return;
        }

        // 4. Send to Backend
        try {
            const response = await fetch('https://shopease-ecommerce-2ut5.onrender.com/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Account created successfully! Please login.');
                window.location.href = 'login.html';
            } else {
                alert(data.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Server error. Please make sure the backend is running!');
        }
    });
}

// --- PASSWORD EYE TOGGLE LOGIC ---

// Toggle Main Password
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

if (togglePassword) {
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.classList.toggle('fa-eye-slash');
    });
}

// Toggle Confirm Password
const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');

if (toggleConfirmPassword) {
    toggleConfirmPassword.addEventListener('click', () => {
        const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmPasswordInput.setAttribute('type', type);
        toggleConfirmPassword.classList.toggle('fa-eye-slash');
    });
}
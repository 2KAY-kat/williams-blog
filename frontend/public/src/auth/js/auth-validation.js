export let isSigningUp = true; 

export function checkPasswordStrength(password) {
    if (password.length < 6) return "weak";
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$~`?%^&*]/.test(password);
    const strength = hasUpperCase + hasLowerCase + hasNumbers + hasSpecialChars;
    if (strength >= 4) return "strong";
    if (strength >= 2) return "medium";
    return "weak";
}

export function checkPasswordMatch() {
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirm-password");
    const matchIcon = document.querySelector(".password-match-icon");
    const mismatchIcon = document.querySelector(".password-mismatch-icon");

    if (!password || !confirmPassword || !matchIcon || !mismatchIcon) return;
    
    const passwordValue = password.value;
    const confirmPasswordValue = confirmPassword.value;

    if (passwordValue === "" || confirmPasswordValue === "") {
        matchIcon.style.display = "none";
        mismatchIcon.style.display = "none";
        return;
    }

    if (passwordValue === confirmPasswordValue) {
        matchIcon.style.display = "inline-block";
        mismatchIcon.style.display = "none";
    } else {
        matchIcon.style.display = "none";
        mismatchIcon.style.display = "inline-block";
    }
}

window.checkPasswordMatch = checkPasswordMatch;


document.addEventListener("DOMContentLoaded", function () {
    
    const authToggleLink = document.getElementById("auth-toggle-link");
    const formSubtitle = document.getElementById("form-subtitle");
    const authButton = document.getElementById("auth-button");
    const signupFields = document.querySelectorAll(".signup-field");
    const togglePrompt = document.getElementById("toggle-prompt");
    
    function toggleAuthMode() {
        if (isSigningUp) {

            formSubtitle.textContent = "Welcome back, Williams!";
            authButton.textContent = "Login";
            authToggleLink.textContent = "Signup";
            togglePrompt.textContent = "Don't have an account?";

            signupFields.forEach((field) => {
                field.style.display = "none";
            });

            document.querySelector('[name="name"]').removeAttribute("required");
            document.getElementById("confirm-password").removeAttribute("required");
        } else {

            formSubtitle.textContent = "Sign up to your blog Williams";
            authButton.textContent = "Sign up";
            authToggleLink.textContent = "Signin";
            togglePrompt.textContent = "Already have an account?";

            signupFields.forEach((field) => {
                field.style.display = "flex"; 
            });

            document.querySelector('[name="name"]').setAttribute("required", "required");
            document.getElementById("confirm-password").setAttribute("required", "required");
        }

        isSigningUp = !isSigningUp;
    }

    if (authToggleLink) {
        authToggleLink.addEventListener("click", function (e) {
            e.preventDefault();
            toggleAuthMode();
        });
    }

    const toggleButtons = document.querySelectorAll(".toggle-password");
    toggleButtons.forEach((button) => {
        button.style.display = "none";
        const inputGroup = button.closest(".input-group");
        const passwordInput = inputGroup ? inputGroup.querySelector(".password-input") : null;

        if (!passwordInput) return;

        button.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                this.classList.replace("fa-eye-slash", "fa-eye");
            } else {
                passwordInput.type = "password";
                this.classList.replace("fa-eye", "fa-eye-slash");
            }
        });

        passwordInput.addEventListener("focus", () => { button.style.display = "block"; });
        passwordInput.addEventListener("blur", () => { if (passwordInput.value === "") { button.style.display = "none"; } });
        passwordInput.addEventListener("input", () => { button.style.display = (passwordInput.value.length > 0) ? "block" : "none"; });
    });

    const passwordField = document.getElementById("password");
    if (passwordField) {
        passwordField.addEventListener("input", function () {
            const password = this.value;
            const meter = document.querySelector(".strength-meter");
            const text = document.querySelector(".strength-text");

            if (meter && text) {
                const strength = checkPasswordStrength(password);
                meter.className = "strength-meter " + strength;
                text.textContent = strength.charAt(0).toUpperCase() + strength.slice(1);
            }
        });
    }
});
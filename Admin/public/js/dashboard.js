<script>
  document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect on success
        window.location.href = '/admin/dashboard';
      } else {
        // Show error with SweetAlert
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: data.error || 'Invalid credentials'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Something went wrong',
        text: 'Please try again later.'
      });
    }
  });
</script>

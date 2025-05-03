document.addEventListener('DOMContentLoaded', function() {
    // Get the logged in user from localStorage
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    
    if (!loggedInUser) {
      window.location.href = '/login.html'; // Redirect if not logged in
      return;
    }
  
    // Fetch current user data
    fetch(`http://localhost:5000/Users/${loggedInUser.id}`)
      .then(response => response.json())
      .then(user => {
        // Populate form with current user data
        document.getElementById('fullName').value = user.FullName || '';
        document.getElementById('userName').value = user.UserName || '';
        document.getElementById('email').value = user.Email || '';
        document.getElementById('phone').value = user.Phone || '';
        document.getElementById('address').value = user.Address || '';
        
        // Set welcome message
        document.getElementById('CustomerName').textContent = `Welcome, ${user.FullName || user.UserName}`;
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        swal("Error", "Failed to load profile data", "error");
      });
  
    // Handle form submission
    document.getElementById('updateProfileForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = {
        FullName: document.getElementById('fullName').value,
        UserName: document.getElementById('userName').value,
        Email: document.getElementById('email').value,
        Phone: document.getElementById('phone').value,
        Address: document.getElementById('address').value,
      };
  
      // Only update password if a new one was provided
      const newPassword = document.getElementById('password').value;
      if (newPassword) {
        formData.Password = newPassword;
      }
  
      // Update user data
      fetch(`http://localhost:5000/Users/${loggedInUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(updatedUser => {
        // Update localStorage with new user data
        const updatedLoggedInUser = {
          ...loggedInUser,
          FullName: updatedUser.FullName,
          UserName: updatedUser.UserName,
          Email: updatedUser.Email
        };
        localStorage.setItem('loggedInUser', JSON.stringify(updatedLoggedInUser));
        
        swal("Success", "Profile updated successfully!", "success")
          .then(() => {
            window.location.href = 'index.html';
          });
      })
      .catch(error => {
        console.error('Error updating profile:', error);
        swal("Error", "Failed to update profile", "error");
      });
    });
  
    // Profile dropdown functionality
    const profileMenu = document.querySelector('.profile-menu');
    const profileBtn = document.getElementById('profileBtn');
    
    profileBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      profileMenu.classList.toggle('active');
    });
    
    document.addEventListener('click', function(e) {
      if (!profileMenu.contains(e.target)) {
        profileMenu.classList.remove('active');
      }
    });
  });
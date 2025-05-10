document.addEventListener('DOMContentLoaded', function() {
    // Get the logged in user from localStorage
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    
    if (!loggedInUser) {
        swal("Error", "You need to log in first", "error").then(() => {
            window.location.href = '/login.html';
        });
        return;
    }
    document.querySelector('.btn-secondary').addEventListener('click', function() {
        window.history.back();
    });
    

    fetch(`http://localhost:5000/Users/${loggedInUser.id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            return response.json();
        })
        .then(user => {
            
            document.getElementById('fullName').value = user.FullName || '';
            document.getElementById('userName').value = user.UserName || '';
            document.getElementById('email').value = user.Email || '';
            document.getElementById('phone').value = user.Phone || '';
            document.getElementById('address').value = user.Address || '';
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
            swal("Error", "Failed to load your profile data", "error");
        });


    document.getElementById('updateProfileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
       
        const formData = {
            FullName: document.getElementById('fullName').value.trim(),
            UserName: document.getElementById('userName').value.trim(),
            Email: document.getElementById('email').value.trim(),
            Phone: document.getElementById('phone').value.trim(),
            Address: document.getElementById('address').value.trim(),
            Type: loggedInUser.Type 
        };

      
        const newPassword = document.getElementById('password').value.trim();
        if (newPassword) {
            formData.Password = newPassword;
        } else {
           
            formData.Password = loggedInUser.Password;
        }

  
        if (!validateEmail(formData.Email)) {
            swal("Error", "Please enter a valid email address", "error");
            return;
        }

        if (!validatePhone(formData.Phone)) {
            swal("Error", "Please enter a valid phone number", "error");
            return;
        }

  
        const submitBtn = document.querySelector('#updateProfileForm button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = "Updating...";

    
        fetch(`http://localhost:5000/Users/${loggedInUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update profile');
            }
            return response.json();
        })
        .then(updatedUser => {
        
            const updatedLoggedInUser = {
                ...loggedInUser,
                FullName: updatedUser.FullName,
                UserName: updatedUser.UserName,
                Email: updatedUser.Email,
                Phone: updatedUser.Phone,
                Address: updatedUser.Address
            };
            
            if (newPassword) {
                updatedLoggedInUser.Password = newPassword;
            }
            
            localStorage.setItem('loggedInUser', JSON.stringify(updatedLoggedInUser));
            
            swal("Success", "Profile updated successfully!", "success")
                .then(() => {
                    window.location.href = 'index.html';
                });
        })
        .catch(error => {
            console.error('Error updating profile:', error);
            swal("Error", "Failed to update profile. Please try again.", "error");
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = "Save Changes";
        });
    });


    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

 
    function validatePhone(phone) {
      
        return /^[0-9]{6,}$/.test(phone);
    }
});
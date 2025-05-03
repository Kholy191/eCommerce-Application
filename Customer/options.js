  // Profile Dropdown Toggle
  document.addEventListener('DOMContentLoaded', function() {
    const profileMenu = document.querySelector('.profile-menu');
    const profileBtn = document.getElementById('profileBtn');
    
    // Toggle dropdown
    profileBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      profileMenu.classList.toggle('active');
    });
    
    // Close when clicking outside
    document.addEventListener('click', function() {
      profileMenu.classList.remove('active');
    });
    
    // Prevent dropdown close when clicking inside
    document.querySelector('.profile-dropdown').addEventListener('click', function(e) {
      e.stopPropagation();
    });
  });
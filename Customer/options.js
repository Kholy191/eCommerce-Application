
  document.addEventListener('DOMContentLoaded', function() {
    const profileMenu = document.querySelector('.profile-menu');
    const profileBtn = document.getElementById('profileBtn');
    
    
    profileBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      profileMenu.classList.toggle('active');
    });
    
  
    document.addEventListener('click', function() {
      profileMenu.classList.remove('active');
    });
    
    
    document.querySelector('.profile-dropdown').addEventListener('click', function(e) {
      e.stopPropagation();
    });
  });
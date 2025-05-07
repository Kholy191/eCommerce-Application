document.addEventListener('DOMContentLoaded', function() {
  // Debugging: Log to confirm script is running
  console.log('Profile button script loaded');
  
  const profileMenu = document.querySelector('.profile-menu');
  const profileBtn = document.getElementById('profileBtn');
  
  // Debugging: Verify elements exist
  if (!profileMenu) {
    console.error('Profile menu element not found!');
    return;
  }
  
  if (!profileBtn) {
    console.error('Profile button element not found!');
    return;
  }
  
  console.log('Profile elements found:', { profileMenu, profileBtn });

  // Toggle dropdown visibility
  profileBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    console.log('Profile button clicked');
    profileMenu.classList.toggle('active');
  });

  // Close dropdown when clicking elsewhere
  document.addEventListener('click', function(e) {
    if (!profileMenu.contains(e.target)) {
      console.log('Clicked outside - closing dropdown');
      profileMenu.classList.remove('active');
    }
  });

  // Prevent dropdown from closing when clicking inside it
  const dropdown = document.querySelector('.profile-dropdown');
  if (dropdown) {
    dropdown.addEventListener('click', function(e) {
      e.stopPropagation();
      console.log('Clicked inside dropdown');
    });
  } else {
    console.error('Dropdown element not found!');
  }
});
const searchInput = document.getElementById('searchInput');
const toggleSearchType = document.getElementById('toggleSearchType');

// Event listener for toggle checkbox
toggleSearchType.addEventListener('change', () => {
  if (toggleSearchType.checked) {
    searchInput.placeholder = "Search by category...";
  } else {
    searchInput.placeholder = "Search by name...";
  }
});

// Event listener for input field to trigger search on each character typed
searchInput.addEventListener('input', () => {
  const searchQuery = searchInput.value.trim();
  
  // You can replace the next line with your actual search functionality
  console.log("Searching for:", searchQuery); // Replace with your actual search logic
  
  // Example of calling a search function:
  // performSearch(searchQuery);
});

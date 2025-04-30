document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    const nameInput = document.getElementById("name");
    const priceInput = document.getElementById("price");
    const descriptionInput = document.getElementById("description");
    const form = document.getElementById("editForm");

    // Fetch the product data from the server (db.json)
    const response = await fetch(`http://localhost:5000/Products/${productId}`);
    const product = await response.json();

    // Pre-fill the form with the current product data
    nameInput.value = product.name;
    priceInput.value = product.price;
    descriptionInput.value = product.description;

    // When the form is submitted, update the product data
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Create the updated product object
        const updatedProduct = {
            name: nameInput.value,
            price: parseFloat(priceInput.value),  // Make sure price is a number
            description: descriptionInput.value
        };

        // Send the updated product data to the server via PATCH
        const updateResponse = await fetch(`http://localhost:5000/Products/${productId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedProduct)
        });

        // Check if the update was successful
        if (updateResponse.ok) {
            // Alert user and reload the page with updated data
            alert("Product updated successfully!");
            window.location.href = "index.html"; // Change to the actual list page
        } else {
            alert("Failed to update the product.");
        }
    });
});

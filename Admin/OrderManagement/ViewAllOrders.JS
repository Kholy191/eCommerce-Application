document.addEventListener('DOMContentLoaded', function() {
    const ordersContainer = document.getElementById('orders-container');
    let allCarts = [];
    let allProducts = [];
    let allCustomers = [];

    async function loadData() {
        try {
            // Load all necessary data
            const [cartsResponse, productsResponse, customersResponse] = await Promise.all([
                fetch('http://localhost:5000/Cart'),
                fetch('http://localhost:5000/Products'),
                fetch('http://localhost:5000/Users')
            ]);
            
            allCarts = await cartsResponse.json();
            allProducts = await productsResponse.json();
            allCustomers = await customersResponse.json();
            
            loadDraftedOrders();
        } catch (error) {
            ordersContainer.innerHTML = '<div class="no-orders">Error loading data</div>';
            console.error(error);
        }
    }

    function loadDraftedOrders() {
        ordersContainer.innerHTML = '';
        
        let hasDraftedOrders = false;
        
        allCarts.forEach(cart => {
            // Filter only drafted orders for this cart
            const draftedOrders = cart.orders.filter(order => 
                order.status && order.status.toLowerCase() === 'drafted'
            );
            
            if (draftedOrders.length > 0) {
                hasDraftedOrders = true;
                
                // Find customer info
                const customer = allCustomers.find(c => c.id === cart.customerId);
                
                // Display each drafted order
                draftedOrders.forEach(order => {
                    const product = allProducts.find(p => p.id === order.productId);
                    if (product) {
                        displayOrder(order, cart.id, customer, product);
                    }
                });
            }
        });
        
        if (!hasDraftedOrders) {
            ordersContainer.innerHTML = '<div class="no-orders">No drafted orders found</div>';
        }
    }

    function displayOrder(order, cartId, customer, product) {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'order';
        orderDiv.innerHTML = `
            <div class="product-info">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-details">
                    <div class="product-name">${product.name}</div>
                    <div>Price: $${parseFloat(product.price).toFixed(2)}</div>
                    <div>Quantity: ${order.quantity}</div>
                    <div>Customer: ${customer ? customer.UserName : 'Unknown'}</div>
                </div>
            </div>
            <button class="btn-delete" data-cart-id="${cartId}" data-order-id="${order.id}">
                Delete Order
            </button>
        `;
        ordersContainer.appendChild(orderDiv);
    }

    async function deleteOrder(cartId, orderId) {
        try {
            // Find the cart
            const cart = allCarts.find(c => c.id === cartId);
            if (!cart) throw new Error('Cart not found');
            
            // Remove the order
            cart.orders = cart.orders.filter(order => order.id !== orderId);
            
            // Update the cart
            const response = await fetch(`http://localhost:5000/Cart/${cartId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cart)
            });
            
            if (!response.ok) throw new Error('Failed to update cart');
            
            // Reload the data
            await loadData();
            
        } catch (error) {
            console.error('Delete error:', error);
            alert('Error deleting order: ' + error.message);
        }
    }

    // Handle delete button clicks
    ordersContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-delete')) {
            if (confirm('Are you sure you want to delete this order?')) {
                const cartId = e.target.getAttribute('data-cart-id');
                const orderId = e.target.getAttribute('data-order-id');
                deleteOrder(cartId, orderId);
            }
        }
    });

    // Initialize
    loadData();
});
document.addEventListener('DOMContentLoaded', function() {
    const ordersContainer = document.getElementById('orders-container');
    let allCarts = []; // Store all carts data

    async function loadDraftedOrders() {
        try {
            const response = await fetch('http://localhost:5000/Cart');
            allCarts = await response.json();
            
            ordersContainer.innerHTML = '';
            
            let hasDraftedOrders = false;
            
            allCarts.forEach(cart => {
                cart.orders.forEach(order => {
                    if (order.status === 'drafted') {
                        hasDraftedOrders = true;
                        displayOrder(order, cart.id, cart.customerId);
                    }
                });
            });
            
            if (!hasDraftedOrders) {
                ordersContainer.innerHTML = '<div class="no-orders">No drafted orders found</div>';
            }
            
        } catch (error) {
            ordersContainer.innerHTML = '<div class="no-orders">Error loading orders</div>';
            console.error(error);
        }
    }

    function displayOrder(order, cartId, customerId) {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'order';
        orderDiv.innerHTML = `
            <div class="product-info">
                <div class="product-details">
                    <div class="product-name">Product ID: ${order.productId}</div>
                    <div>Quantity: ${order.quantity}</div>
                    <div>Customer ID: ${customerId}</div>
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
            // Find the cart in our stored data
            const cart = allCarts.find(c => c.id === cartId);
            if (!cart) throw new Error('Cart not found');
            
            // Filter out the deleted order
            cart.orders = cart.orders.filter(order => order.id !== orderId);
            
            // Update the cart on the server
            const response = await fetch(`http://localhost:5000/Cart/${cartId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cart)
            });
            
            if (!response.ok) throw new Error('Failed to update cart');
            
            // Reload the orders
            loadDraftedOrders();
            
        } catch (error) {
            console.error('Delete error:', error);
            alert('Error deleting order: ' + error.message);
        }
    }

    // Handle delete button clicks
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-delete')) {
            if (confirm('Are you sure you want to delete this order?')) {
                const cartId = e.target.getAttribute('data-cart-id');
                const orderId = e.target.getAttribute('data-order-id');
                deleteOrder(cartId, orderId);
            }
        }
    });

    // Load orders when page loads
    loadDraftedOrders();
});
document.addEventListener('DOMContentLoaded', function() {
    const ordersContainer = document.getElementById('orders-container');
    let productsData = [];
    let cartsData = [];
    let usersData = [];

    function showNoOrdersMessage() {
        ordersContainer.innerHTML = `
            <div class="no-orders-container">
                <div class="no-orders">
                    <h3>No Drafted Orders Found</h3>
                    <p>No orders </p>
                </div>
            </div>
        `;
    }

    function showErrorMessage(error) {
        ordersContainer.innerHTML = `
            <div class="no-orders-container">
                <div class="no-orders">
                    <h3>Error Loading Orders</h3>
                    <p>${error.message || 'Failed to load orders. Please try again later.'}</p>
                </div>
            </div>
        `;
    }

    async function loadData() {
        try {
            // Load all data
            const [productsResponse, cartsResponse, usersResponse] = await Promise.all([
                fetch('http://localhost:5000/Products'),
                fetch('http://localhost:5000/Cart'),
                fetch('http://localhost:5000/Users')
            ]);

            if (!productsResponse.ok || !cartsResponse.ok || !usersResponse.ok) {
                throw new Error('Failed to fetch data');
            }

            productsData = await productsResponse.json();
            cartsData = await cartsResponse.json();
            usersData = await usersResponse.json();

            loadDraftedOrders();
        } catch (error) {
            console.error('Error loading data:', error);
            showErrorMessage(error);
        }
    }

    function createOrderCard(order) {
        const product = productsData.find(p => p.id === order.productId);
        const customer = usersData.find(u => u.id === order.customerId);

        if (!product) return null;

        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <div class="product-info">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-details">
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
                    <div class="product-quantity">Quantity: ${order.quantity}</div>
                    <div class="customer-name">Customer: ${customer ? customer.UserName : 'Unknown'}</div>
                </div>
            </div>
            <button class="btn-ship" data-cart-id="${order.cartId}" data-order-id="${order.id}">
                Mark as Shipped
            </button>
        `;
        return orderCard;
    }

    function loadDraftedOrders() {
        try {
            // Find all drafted orders
            let draftedOrders = [];
            cartsData.forEach(cart => {
                cart.orders.forEach(order => {
                    if (order.status && order.status.toLowerCase() === 'drafted') {
                        draftedOrders.push({
                            ...order,
                            cartId: cart.id,
                            customerId: cart.customerId
                        });
                    }
                });
            });

            // Display orders or show message if none
            if (draftedOrders.length === 0) {
                showNoOrdersMessage();
                return;
            }

            ordersContainer.innerHTML = '';
            draftedOrders.forEach(order => {
                const orderCard = createOrderCard(order);
                if (orderCard) {
                    ordersContainer.appendChild(orderCard);
                }
            });

            // Add event listeners to ship buttons
            document.querySelectorAll('.btn-ship').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const cartId = this.getAttribute('data-cart-id');
                    const orderId = this.getAttribute('data-order-id');
                    
                    if (confirm('Are you sure you want to mark this order as shipped?')) {
                        await updateOrderStatus(cartId, orderId, 'shipped');
                    }
                });
            });

        } catch (error) {
            console.error('Error loading orders:', error);
            showErrorMessage(error);
        }
    }

    async function updateOrderStatus(cartId, orderId, newStatus) {
        try {
            // Get the cart
            const cart = cartsData.find(c => c.id === cartId);
            if (!cart) throw new Error('Cart not found');
            
            // Find and update the order
            const order = cart.orders.find(o => o.id === orderId);
            if (!order) throw new Error('Order not found');
            
            order.status = newStatus;
            
            // Update on server
            const response = await fetch(`http://localhost:5000/Cart/${cartId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cart)
            });
            
            if (!response.ok) throw new Error('Failed to update order status');
            
            // Reload the data to reflect changes
            await loadData();
            
        } catch (error) {
            console.error('Error updating order status:', error);
            alert(`Error updating order status: ${error.message}`);
        }
    }

    // Initialize the page
    loadData();
});
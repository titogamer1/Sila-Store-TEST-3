document.addEventListener('DOMContentLoaded', () => {
    // --- Sidebar Menu ---
    const menuBtn = document.getElementById('menuBtn');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    function openSidebar() {
        sidebar.classList.add('active');
        sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebarFunc() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if(menuBtn) menuBtn.addEventListener('click', openSidebar);
    if(closeSidebar) closeSidebar.addEventListener('click', closeSidebarFunc);
    if(sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebarFunc);

    const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', closeSidebarFunc);
    });

    // --- Theme Toggle ---
    const themeToggle = document.querySelector('.theme-toggle');
    const currentTheme = localStorage.getItem('sila_theme');
    
    // Default is Dark mode. We toggle to light mode.
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        const text = themeToggle.querySelector('.theme-text');
        // Initial button state (already matches Dark Mode)
        if(icon && text) {
            icon.className = 'far fa-sun';
            text.textContent = 'LIGHT';
        }
    }

    if (currentTheme === 'light') {
        document.body.classList.add('light-mode');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            const text = themeToggle.querySelector('.theme-text');
            if(icon && text) {
                icon.className = 'fas fa-moon';
                text.textContent = 'DARK';
            }
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const icon = themeToggle.querySelector('i');
            const text = themeToggle.querySelector('.theme-text');
            
            document.body.classList.toggle('light-mode');
            
            if(document.body.classList.contains('light-mode')) {
                localStorage.setItem('sila_theme', 'light');
                if(icon && text) {
                    icon.className = 'fas fa-moon';
                    text.textContent = 'DARK';
                }
            } else {
                localStorage.setItem('sila_theme', 'dark');
                if(icon && text) {
                    icon.className = 'far fa-sun';
                    text.textContent = 'LIGHT';
                }
            }
        });
    }

    // --- Cart Functionality ---
    const cartBtn = document.getElementById('cartBtn');
    const closeCart = document.getElementById('closeCart');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartItemsContainer = document.getElementById('cartItems');
    const subtotalEl = document.getElementById('subtotal');
    const totalPriceEl = document.getElementById('totalPrice');
    const cartBadge = document.getElementById('cartBadge');
    
    const shippingCost = 65;
    let cart = JSON.parse(localStorage.getItem('sila_cart')) || [];

    function openCart() {
        if(cartSidebar) cartSidebar.classList.add('active');
        if(cartOverlay) cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCartFunc() {
        if(cartSidebar) cartSidebar.classList.remove('active');
        if(cartOverlay) cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if(cartBtn) cartBtn.addEventListener('click', openCart);
    if(closeCart) closeCart.addEventListener('click', closeCartFunc);
    if(cartOverlay) cartOverlay.addEventListener('click', closeCartFunc);

    function updateCartUI() {
        if(!cartItemsContainer) return;
        
        cartItemsContainer.innerHTML = '';
        let subtotal = 0;
        let totalItems = 0;

        cart.forEach((item, index) => {
            subtotal += item.price * item.quantity;
            totalItems += item.quantity;

            const cartItemHTML = `
                <div class="cart-item">
                    <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">${item.price} ج.م</div>
                        <div class="cart-item-controls">
                            <button class="qty-btn minus-btn" data-index="${index}">-</button>
                            <input type="text" class="qty-input" value="${item.quantity}" readonly>
                            <button class="qty-btn plus-btn" data-index="${index}">+</button>
                            <button class="remove-item" data-index="${index}"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </div>
                </div>
            `;
            cartItemsContainer.insertAdjacentHTML('beforeend', cartItemHTML);
        });

        if(subtotalEl) subtotalEl.textContent = `${subtotal} ج.م`;
        const total = subtotal > 0 ? subtotal + shippingCost : 0;
        if(totalPriceEl) totalPriceEl.textContent = `${total} ج.م`;
        if(cartBadge) cartBadge.textContent = totalItems;
        
        localStorage.setItem('sila_cart', JSON.stringify(cart));

        document.querySelectorAll('.plus-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.closest('.qty-btn').dataset.index;
                cart[idx].quantity++;
                updateCartUI();
            });
        });

        document.querySelectorAll('.minus-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.closest('.qty-btn').dataset.index;
                if (cart[idx].quantity > 1) {
                    cart[idx].quantity--;
                } else {
                    cart.splice(idx, 1);
                }
                updateCartUI();
            });
        });

        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.closest('.remove-item').dataset.index;
                cart.splice(idx, 1);
                updateCartUI();
            });
        });
    }

    // Attach cart functionality globally
    window.addToCart = function(id, name, price, img, quantity = 1) {
        const existingItem = cart.find(item => item.id == id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ id, name, price, img, quantity });
        }
        updateCartUI();
        openCart();
    };

    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const btnEl = e.currentTarget;
            const id = btnEl.dataset.id;
            const name = btnEl.dataset.name;
            const price = parseInt(btnEl.dataset.price);
            const img = btnEl.dataset.img;
            window.addToCart(id, name, price, img, 1);
        });
    });

    updateCartUI();

    // --- WhatsApp Checkout Logic ---
    const checkoutBtns = document.querySelectorAll('.checkout-btn');
    checkoutBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('سلة المشتريات فارغة!');
                return;
            }

            let orderCode = localStorage.getItem('sila_order_code') || 0;
            orderCode = parseInt(orderCode) + 1;
            localStorage.setItem('sila_order_code', orderCode);
            
            const paddedCode = String(orderCode).padStart(4, '0');
            const currentDate = new Date().toLocaleDateString('ar-EG');
            
            let msg = `*اهلا و سهلا بكم في *SILA Store**\n\n`;
            msg += `*يسعدنا تواصلك معنا لإتمام طلبك*\n\n`;
            msg += `*كود الطلب:* #${paddedCode}\n\n`;
            msg += `*تاريخ الطلب :* ${currentDate}\n\n`;
            msg += `*---------------------------*\n\n`;
            
            let subtotal = 0;
            cart.forEach(item => {
                subtotal += item.price * item.quantity;
                
                let color = '';
                let cleanName = item.name;
                if (item.name.includes('-')) {
                    const parts = item.name.split('-');
                    cleanName = parts[0].trim();
                    color = parts[1].trim();
                }

                msg += `📦 *${cleanName}*\n\n`;
                
                if (item.size) {
                    msg += `📏 المقاس: ${item.size} | اللون: ${color}\n\n`;
                } else if (color) {
                    msg += `📏 اللون: ${color}\n\n`;
                }
                
                msg += `🛒 الكمية: ${item.quantity} قطع\n`;
                msg += `*---------------------------*\n`;
            });
            
            msg += `*سعر المنتجات:* ${subtotal} ج.م\n`;
            msg += `*سعر التوصيل:* ${shippingCost} ج.م\n`;
            msg += `*الإجمالي المطلوب:* ${subtotal + shippingCost} ج.م\n`;
            msg += `*---------------------------*\n`;
            msg += `يرجى إرسال *العنوان التفصيلي* وانتظار الرد لإتمام عملية الشراء.\n\n`;
            msg += `*شكراً لاختيارك منتجاتنا!*`;

            const whatsappNum = '201060944372';
            const whatsappUrl = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(msg)}`;
            
            window.open(whatsappUrl, '_blank');
        });
    });

    // --- AI Modal & Functionality ---
    const aiBtn = document.querySelector('.ai-floating-btn');
    let aiModal = null;
    if (aiBtn) {
        aiBtn.innerHTML = '✨';
        aiBtn.style.fontSize = '24px';
        aiBtn.style.display = 'flex';
        aiBtn.style.alignItems = 'center';
        aiBtn.style.justifyContent = 'center';
        
        aiModal = document.createElement('div');
        aiModal.className = 'ai-modal';
        aiModal.innerHTML = `
            <div class="ai-modal-content">
                <div class="ai-modal-header">
                    <h3>المساعد الذكي ✨</h3>
                    <button id="closeAiModal">&times;</button>
                </div>
                <div class="ai-modal-body" id="aiModalBody">
                    <p class="ai-message">أهلاً بك! أنا مساعدك الذكي. كيف يمكنني مساعدتك في التسوق اليوم؟</p>
                </div>
                <div class="ai-modal-footer">
                    <input type="text" id="aiInput" placeholder="اسألني أي شيء...">
                    <button id="aiSendBtn"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        `;
        document.body.appendChild(aiModal);

        aiBtn.addEventListener('click', () => {
            aiModal.classList.add('active');
            aiBtn.style.display = 'none';
        });

        document.getElementById('closeAiModal').addEventListener('click', () => {
            aiModal.classList.remove('active');
            setTimeout(() => {
                aiBtn.style.display = 'flex';
            }, 300);
        });

        const aiInput = document.getElementById('aiInput');
        const aiSendBtn = document.getElementById('aiSendBtn');
        const aiModalBody = document.getElementById('aiModalBody');

        function sendAiMessage() {
            const text = aiInput.value.trim();
            if(!text) return;
            aiModalBody.innerHTML += `<p class="user-message">${text}</p>`;
            aiInput.value = '';
            aiModalBody.scrollTop = aiModalBody.scrollHeight;
            
            const typingId = 'typing-' + Date.now();
            aiModalBody.innerHTML += `<p class="ai-message" id="${typingId}">جاري التفكير...</p>`;
            aiModalBody.scrollTop = aiModalBody.scrollHeight;

            setTimeout(() => {
                const typingEl = document.getElementById(typingId);
                let response = "عذراً، لم أفهم طلبك بالكامل. هل تبحث عن ساعات، نظارات، أم مجوهرات؟";
                
                if (text.includes('اكسسوارات') || text.includes('منتج') || text.includes('منتجات')) {
                    response = "لدينا تشكيلة رائعة من الإكسسوارات الفاخرة! يمكنك تفقد 'سوار الياقوت الفضي' أو 'ساعة SILA ملوكي'. هل تريد تفاصيل أكثر؟";
                } else if (text.includes('سعر') || text.includes('بكم') || text.includes('اسعار')) {
                    response = "أسعارنا تنافسية جداً وتبدأ من 720 ج.م لأقراط اللؤلؤ وتصل إلى 3890 ج.م لقلادة الأميرة. ما هو المنتج الذي تبحث عنه تحديداً؟";
                } else if (text.includes('ساعة') || text.includes('ساعات')) {
                    response = "ساعاتنا مميزة جداً! أحدث إصدار لدينا هو 'ساعة SILA ملوكي - ذهبي' بسعر 2450 ج.م. يمكنك العثور عليها في قسم الرجال.";
                } else if (text.includes('سلام') || text.includes('مرحبا') || text.includes('اهلا')) {
                    response = "أهلاً بك في SILA Store! كيف يمكنني مساعدتك في العثور على أفضل القطع اليوم؟";
                }
                
                if(typingEl) typingEl.textContent = response;
                aiModalBody.scrollTop = aiModalBody.scrollHeight;
            }, 1000);
        }

        aiSendBtn.addEventListener('click', sendAiMessage);
        aiInput.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') sendAiMessage();
        });
    }

    // --- Search Functionality ---
    const searchInputs = document.querySelectorAll('.search-bar input');
    const searchIcons = document.querySelectorAll('.search-bar .search-icon');
    const searchBadges = document.querySelectorAll('.search-bar .search-badge');
    
    const allProductsSearch = [
        { id: 1, name: "سوار الياقوت - فضي", price: 950, img: "bracelet_silver.png" },
        { id: 2, name: "قلادة الأميرة - ذهبي", price: 3890, img: "necklace_gold.png" },
        { id: 3, name: "ساعة SILA ملوكي - ذهبي", price: 2450, img: "watch_gold.png" },
        { id: 4, name: "أقراط اللؤلؤ - ذهبي", price: 720, img: "earrings_gold.png" },
        { id: 5, name: "نظارة ONYX السوداء", price: 1650, img: "sunglasses_black.png" },
        { id: 6, name: "خاتم الفارس - فضي", price: 1250, img: "ring_silver.png" }
    ];

    function performSearch(query) {
        if(!query) return;
        const match = allProductsSearch.find(p => p.name.includes(query) || query.includes(p.name.split(' ')[0]));
        if(match) {
            window.location.href = `product.html?id=${match.id}`;
        } else {
            alert('عذراً، لم يتم العثور على منتج يطابق بحثك.');
        }
    }

    searchInputs.forEach((input, index) => {
        const wrapper = input.closest('.search-bar');
        wrapper.style.position = 'relative';
        
        const dropdown = document.createElement('div');
        dropdown.className = 'search-dropdown';
        dropdown.style.display = 'none';
        wrapper.appendChild(dropdown);
        
        input.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            dropdown.innerHTML = '';
            if (query.length > 0) {
                const matches = allProductsSearch.filter(p => p.name.toLowerCase().includes(query));
                if (matches.length > 0) {
                    matches.forEach(match => {
                        const item = document.createElement('div');
                        item.className = 'search-dropdown-item';
                        item.textContent = match.name;
                        item.addEventListener('click', () => {
                            window.location.href = `product.html?id=${match.id}`;
                        });
                        dropdown.appendChild(item);
                    });
                    dropdown.style.display = 'block';
                } else {
                    dropdown.style.display = 'none';
                }
            } else {
                dropdown.style.display = 'none';
            }
        });
        
        // Hide dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });

        input.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') {
                performSearch(input.value.trim());
            }
        });
        
        if(searchIcons[index]) {
            searchIcons[index].addEventListener('click', () => {
                performSearch(input.value.trim());
            });
            searchIcons[index].style.cursor = 'pointer';
        }

        if(searchBadges[index]) {
            searchBadges[index].addEventListener('click', () => {
                if(aiModal) aiModal.classList.add('active');
            });
            searchBadges[index].style.cursor = 'pointer';
        }
    });

    // --- Review System ---
    const reviewInput = document.querySelector('.review-input-container input');
    const reviewStars = document.querySelectorAll('.review-stars i');
    const emptyReviews = document.querySelector('.empty-reviews');
    let selectedRating = 0;

    if(reviewInput && reviewStars.length > 0) {
        reviewStars.forEach((star, index) => {
            star.style.cursor = 'pointer';
            star.addEventListener('click', () => {
                selectedRating = index + 1;
                reviewStars.forEach((s, i) => {
                    s.className = i < selectedRating ? 'fas fa-star text-gold' : 'far fa-star';
                });
            });
        });

        reviewInput.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') {
                const text = reviewInput.value.trim();
                if(text && selectedRating > 0) {
                    if(emptyReviews) emptyReviews.style.display = 'none';
                    
                    let starsHtml = '';
                    for(let i=0; i<5; i++) {
                        starsHtml += i < selectedRating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
                    }

                    const reviewHtml = `
                        <div style="background: var(--card-bg); padding: 15px; border-radius: 10px; margin-bottom: 10px; border: 1px solid var(--border-color);">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <strong>عميل مميز</strong>
                                <div class="pd-rating" style="color: var(--primary-gold); font-size: 12px;">${starsHtml}</div>
                            </div>
                            <p style="color: var(--text-secondary); font-size: 14px;">${text}</p>
                        </div>
                    `;
                    
                    reviewInput.parentElement.insertAdjacentHTML('beforebegin', reviewHtml);
                    reviewInput.value = '';
                    selectedRating = 0;
                    reviewStars.forEach(s => s.className = 'far fa-star');
                } else {
                    alert('يرجى كتابة تعليق واختيار تقييم من 5 نجوم');
                }
            }
        });
    }
});

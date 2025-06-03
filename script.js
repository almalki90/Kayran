// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // جلب إعدادات المتجر
    const storeSettings = JSON.parse(localStorage.getItem('store_settings')) || {
        mobileOnly: true,
        showBadges: true,
        showGallery: true,
        whatsappNumber: '966554986678',
        email: 'info@khiran-store.com',
        headerImageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
        fixedHeader: true
    };

    // تطبيق إعدادات الهيدر
    const storeHeader = document.getElementById('store-header');
    const heroImage = document.getElementById('hero-image');
    
    // تعيين صورة الهيدر من الإعدادات
    heroImage.src = storeSettings.headerImageUrl;
    
    // تطبيق خاصية تثبيت الهيدر
    if (storeSettings.fixedHeader) {
        storeHeader.classList.add('sticky-header');
    } else {
        storeHeader.classList.remove('sticky-header');
    }

    // التحقق من جهاز الجوال
    if (storeSettings.mobileOnly && !/Mobi|Android/i.test(navigator.userAgent)) {
        document.getElementById('mobile-warning').style.display = 'flex';
        document.getElementById('store-wrapper').style.display = 'none';
    }
    
    // جلب المنتجات من localStorage (تم إضافته للربط مع لوحة التحكم)
    const products = JSON.parse(localStorage.getItem('store_products')) || [];
    
    // تحميل المنتجات في الصفحة
    function loadProducts() {
        const productsList = document.querySelector('.products-list');
        
        // إذا كان هناك منتجات في localStorage، قم بعرضها
        if (products && products.length > 0) {
            productsList.innerHTML = ''; // مسح المنتجات الحالية
            
            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                
                // إنشاء معرض الصور
                let galleryHTML = '';
                if (storeSettings.showGallery && product.gallery && product.gallery.length > 0) {
                    galleryHTML = '<div class="product-gallery">';
                    product.gallery.forEach((galleryImage, index) => {
                        galleryHTML += `
                            <img src="${galleryImage}" alt="معرض ${index + 1}" 
                                class="gallery-image ${index === 1 ? 'active' : ''}" 
                                onclick="changeMainImage(this)">
                        `;
                    });
                    galleryHTML += '</div>';
                }
                
                // إنشاء بطاقة المنتج
                productCard.innerHTML = `
                    <div class="product-image-container">
                        <img src="${product.image}" alt="${product.name}" class="product-image">
                        ${storeSettings.showBadges && product.badge && product.badge !== 'none' ? `<span class="product-badge">${product.badge}</span>` : ''}
                    </div>
                    <div class="product-content">
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-description">${product.description}</p>
                        
                        ${galleryHTML}
                        
                        <div class="product-price-container">
                            <div>
                                <span class="product-currency">SAR</span>
                                <span class="product-price">${product.price}</span>
                            </div>
                            <button class="buy-now" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.image}">
                                <i class="fas fa-shopping-cart"></i> شراء الآن
                            </button>
                        </div>
                    </div>
                `;
                
                productsList.appendChild(productCard);
            });
            
            // إعادة تهيئة أحداث معرض الصور
            initGalleryEvents();
            
            // إعادة تهيئة أزرار الشراء
            initBuyButtons();
        }
    }
    
    // تهيئة أحداث معرض الصور
    function initGalleryEvents() {
        const galleryImages = document.querySelectorAll('.gallery-image');
        galleryImages.forEach(img => {
            img.addEventListener('click', function() {
                // إزالة النشاط من جميع الصور
                const siblings = this.parentElement.querySelectorAll('.gallery-image');
                siblings.forEach(i => i.classList.remove('active'));
                
                // إضافة النشاط للصورة المحددة
                this.classList.add('active');
                
                // تغيير الصورة الرئيسية
                const productCard = this.closest('.product-card');
                const mainImage = productCard.querySelector('.product-image');
                mainImage.src = this.src;
            });
        });
    }
    
    // تحميل المنتجات عند بدء التشغيل
    loadProducts();
    
    // إدارة سلة التسوق
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartButton = document.getElementById('cart-button');
    const cartCount = document.getElementById('cart-count');
    const cartModal = document.getElementById('cart-modal');
    const closeCart = document.getElementById('close-cart');
    const cartItems = document.getElementById('cart-items');
    const totalAmount = document.getElementById('total-amount');
    const checkoutButton = document.getElementById('checkout-button');
    const continueShopping = document.getElementById('continue-shopping');
    const confirmationMessage = document.getElementById('confirmation-message');
    
    // تحديث سلة التسوق
    function updateCart() {
        // تحديث العداد
        cartCount.textContent = cart.length;
        
        // تحديث قائمة المنتجات في السلة
        cartItems.innerHTML = '';
        let total = 0;
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<p style="text-align: center; padding: 20px; color: #778da9;">سلة التسوق فارغة</p>';
            totalAmount.textContent = '0 SAR';
            return;
        }
        
        cart.forEach(item => {
            total += item.price;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price} SAR</div>
                </div>
                <button class="remove-item" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            cartItems.appendChild(cartItem);
        });
        
        // تحديث المجموع الكلي
        totalAmount.textContent = `${total} SAR`;
        
        // حفظ السلة في localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // تحديث إحصائيات المتجر
        updateStoreStats(total);
    }
    
    // تحديث إحصائيات المتجر
    function updateStoreStats(orderTotal = 0) {
        // جلب الإحصائيات الحالية
        const storeStats = JSON.parse(localStorage.getItem('store_stats')) || {
            totalOrders: 0,
            totalViews: 0,
            totalRevenue: 0
        };
        
        // زيادة عدد المشاهدات عند تحميل الصفحة (مرة واحدة فقط)
        if (!sessionStorage.getItem('view_counted')) {
            storeStats.totalViews++;
            sessionStorage.setItem('view_counted', 'true');
        }
        
        // حفظ الإحصائيات
        localStorage.setItem('store_stats', JSON.stringify(storeStats));
    }
    
    // تهيئة أزرار الشراء
    function initBuyButtons() {
        const buyButtons = document.querySelectorAll('.buy-now');
        buyButtons.forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.dataset.id;
                const productName = this.dataset.name;
                const productPrice = parseInt(this.dataset.price);
                const productImage = this.dataset.image;
                
                // إضافة المنتج إلى السلة
                cart.push({
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImage
                });
                
                // تحديث السلة
                updateCart();
                
                // عرض رسالة التأكيد
                confirmationMessage.style.display = 'block';
                setTimeout(() => {
                    confirmationMessage.style.display = 'none';
                }, 3000);
            });
        });
    }
    
    // فتح وإغلاق سلة التسوق
    cartButton.addEventListener('click', () => {
        cartModal.style.display = 'block';
        updateCart();
    });
    
    closeCart.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });
    
    continueShopping.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });
    
    // إزالة عنصر من السلة
    document.addEventListener('click', (e) => {
        if (e.target.closest('.remove-item')) {
            const itemId = e.target.closest('.remove-item').dataset.id;
            cart = cart.filter(item => item.id !== itemId);
            updateCart();
        }
    });
    
    // إتمام الشراء عبر واتساب
    checkoutButton.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('سلة التسوق فارغة! أضف منتجات قبل إتمام الشراء.');
            return;
        }
        
        // بناء رسالة الطلب
        let message = `مرحبًا، أود شراء المنتجات التالية من متجر خيران:\n\n`;
        
        let total = 0;
        cart.forEach((item, index) => {
            message += `${index + 1}. ${item.name}: ${item.price} SAR\n`;
            total += item.price;
        });
        
        message += `\nالمجموع الكلي: ${total} SAR\n\n`;
        message += `شكرًا لخدمتكم المميزة، أتمنى أن يتم التوصيل في أقرب وقت.`;
        
        // ترميز الرسالة للرابط
        const encodedMessage = encodeURIComponent(message);
        
        // رقم الواتساب بالتنسيق الدولي (بدون +)
        const whatsappNumber = storeSettings.whatsappNumber;
        
        // إنشاء رابط واتساب
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;
        
        // استراتيجيات متعددة لفتح واتساب بموثوقية
        try {
            // الطريقة 1: إنشاء رابط مخفي والنقر عليه (الأكثر موثوقية على الجوال)
            const whatsappLink = document.getElementById('whatsapp-link');
            whatsappLink.href = whatsappUrl;
            whatsappLink.click();
            
            // الطريقة 2: فتح نافذة جديدة مع معالجة منع النوافذ المنبثقة
            setTimeout(() => {
                const newWindow = window.open(whatsappUrl, '_blank');
                if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                    // إذا فشل فتح النافذة، استخدام الطريقة 3
                    window.location.href = whatsappUrl;
                }
            }, 200);
        } catch (e) {
            // في حالة حدوث خطأ، فتح الرابط مباشرة
            window.location.href = whatsappUrl;
        }
        
        // تحديث إحصائيات المتجر
        const storeStats = JSON.parse(localStorage.getItem('store_stats')) || {
            totalOrders: 0,
            totalViews: 0,
            totalRevenue: 0
        };
        
        storeStats.totalOrders++;
        storeStats.totalRevenue += total;
        localStorage.setItem('store_stats', JSON.stringify(storeStats));
        
        // تفريغ السلة بعد إتمام الطلب
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
        cartModal.style.display = 'none';
    });
    
    // تحديث السلة عند التحميل
    updateCart();
    
    // تحديث إحصائيات المتجر عند التحميل
    updateStoreStats();
    
    // الاستماع لتغييرات localStorage من لوحة التحكم
    window.addEventListener('storage', function(e) {
        if (e.key === 'store_products') {
            // إعادة تحميل المنتجات عند تغييرها من لوحة التحكم
            loadProducts();
        } else if (e.key === 'store_settings') {
            // إعادة تحميل إعدادات المتجر عند تغييرها من لوحة التحكم
            const newSettings = JSON.parse(localStorage.getItem('store_settings')) || {};
            
            // تحديث صورة الهيدر
            if (newSettings.headerImageUrl) {
                heroImage.src = newSettings.headerImageUrl;
            }
            
            // تحديث خاصية تثبيت الهيدر
            if (newSettings.fixedHeader !== undefined) {
                if (newSettings.fixedHeader) {
                    storeHeader.classList.add('sticky-header');
                } else {
                    storeHeader.classList.remove('sticky-header');
                }
            }
            
            // إعادة تحميل المنتجات لتطبيق إعدادات الشارات والمعرض
            loadProducts();
        }
    });
});

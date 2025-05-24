// --- Header --- //
const header = document.querySelector('.header-top');
const logo = document.querySelector('.header-bar-logo');

document.addEventListener("DOMContentLoaded", function () {
    logo.addEventListener("click", function (event) {
        if (window.location.pathname !== "/index.html") return;
        event.preventDefault();
        window.scrollTo(0, 0);
        location.reload();
    });
});

window.addEventListener('scroll', () => {
    if (window.scrollY > 0) {
        header.style.backgroundColor = '#eaeaea';
        header.style.opacity = '0.8';
    } else {
        header.style.backgroundColor = '#eaeaea';
        header.style.opacity = '1';
    }
});


// --- Меню Каталога --- //
const menuButton = document.getElementById('menuButton');
const catalogMenu = document.getElementById('catalogMenu');

menuButton?.addEventListener('click', function () {
    this.classList.toggle("is-active");
    catalogMenu.classList.toggle('active');
});

document.addEventListener('click', function (event) {
    if (!menuButton.contains(event.target) && !catalogMenu.contains(event.target)) {
        catalogMenu.classList.remove('active');
    }
});


// --- Слайдер --- //
function setupSlider(containerSelector, sliderSelector, innerSelector, prevBtnSelector, nextBtnSelector) {
    document.querySelectorAll(containerSelector).forEach(container => {
        let index = 0;
        let startX = 0;
        let isSwiping = false;
        const slider = container.querySelector(sliderSelector);
        const slides = slider.querySelectorAll(innerSelector);
        const prevButton = container.querySelector(prevBtnSelector);
        const nextButton = container.querySelector(nextBtnSelector);
        let autoSlideInterval;
        let isAutoSliding = false;

        function updateSlider() {
            slider.style.transform = `translateX(-${index * 100}%)`;
            prevButton.style.visibility = index === 0 ? "hidden" : "visible";
            nextButton.style.visibility = index === slides.length - 1 ? "hidden" : "visible";
        }

        function nextSlide() {
            index = (index + 1) % slides.length;
            updateSlider();
        }

        function startAutoSlide() {
            if (!isAutoSliding) {
                autoSlideInterval = setInterval(nextSlide, 4000);
                isAutoSliding = true;
            }
        }

        function stopAutoSlide() {
            clearInterval(autoSlideInterval);
            isAutoSliding = false;
        }

        function resetSlider() {
            index = 0;
            updateSlider();
        }

        updateSlider();

        prevButton.addEventListener('click', () => {
            stopAutoSlide();
            if (index > 0) index--;
            updateSlider();
            startAutoSlide();
        });

        nextButton.addEventListener('click', () => {
            stopAutoSlide();
            if (index < slides.length - 1) index++;
            updateSlider();
            startAutoSlide();
        });

        slider.addEventListener('touchstart', (e) => {
            stopAutoSlide();
            startX = e.touches[0].clientX;
            isSwiping = true;
        }, { passive: true });

        slider.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;
            const currentX = e.touches[0].clientX;
            const diffX = startX - currentX;
            if (Math.abs(diffX) > 30) {
                if (diffX > 0 && index < slides.length - 1) index++;
                else if (diffX < 0 && index > 0) index--;
                updateSlider();
                isSwiping = false;
            }
        }, { passive: true });

        slider.addEventListener('touchend', () => {
            isSwiping = false;
            startAutoSlide();
        });

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startAutoSlide();
                } else {
                    stopAutoSlide();
                    resetSlider();
                }
            });
        }, { threshold: 0.5 });

        observer.observe(container);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    setupSlider('.promo-sliders', '.promo-slider-track', '.promo-slider', '.prev-slide', '.next-slide');
    setupSlider('.brands-slider-container', '.brands-slider-track', '.brand-slide', '.brand-prev', '.brand-next');
});


// --- Поиск товара --- //
const globalSearchInput = document.getElementById('searchInput');
const globalSearchBtn = document.getElementById('searchBtn');

if (globalSearchInput && globalSearchBtn) {
    const goToSearchPage = () => {
        const query = globalSearchInput.value.trim();
        if (query) {
            const isInPagesFolder = window.location.pathname.includes('/pages/');
            const pathPrefix = isInPagesFolder ? './' : './pages/';
            window.location.href = `${pathPrefix}search.html?query=${encodeURIComponent(query)}`;
        }
    };

    globalSearchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToSearchPage();
    });

    globalSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            goToSearchPage();
        }
    });
}


// --- Страница Поиск (search.html) --- //
document.addEventListener('DOMContentLoaded', function () {
    fetch('../data/products.json')
        .then(response => response.json())
        .then(data => {
            const productContainer = document.getElementById('product-container');
            const searchResults = document.getElementById('search-results');
            const renderProductCard = (product, target) => {
                const card = document.createElement('div');
                card.className = 'card';
                card.dataset.id = product.id;
                card.innerHTML = `
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <p class="price">${product.price.toLocaleString()} сум</p>
                    <button class="add-to-cart">
                        В корзину
                        <img src="../images/icons/icon-cart2.png" alt="Корзина" class="cart-icon">
                    </button>
                `;
                // Добавляем обработчик клика по картинке
                const img = card.querySelector('.product-image');
                if (img) {
                    img.addEventListener('click', () => openProductModal(product));
                }

                target.appendChild(card);
            };

            const displayAllProducts = () => {
                if (!productContainer) return;
                productContainer.innerHTML = '';
                Object.values(data.categories).forEach(category => {
                    category.products.forEach(product => renderProductCard(product, productContainer));
                });
            };

            const displayProductsByCategory = (categoryKey) => {
                if (!productContainer) return;
                productContainer.innerHTML = '';
                const category = data.categories[categoryKey];
                if (!category) {
                    productContainer.innerHTML = `<p>Товары не найдены.</p>`;
                    return;
                }
                category.products.forEach(product => renderProductCard(product, productContainer));
            };

            const searchProducts = (query, targetContainer) => {
                const normalizedQuery = query.toLowerCase();
                const results = [];
                Object.values(data.categories).forEach(category => {
                    category.products.forEach(product => {
                        if (product.name.toLowerCase().includes(normalizedQuery)) {
                            results.push(product);
                        }
                    });
                });
                targetContainer.innerHTML = '';
                if (results.length === 0) {
                    targetContainer.innerHTML = '<p>Товар не найден.</p>';
                } else {
                    results.forEach(product => renderProductCard(product, targetContainer));
                }
            };

            const urlParams = new URLSearchParams(window.location.search);
            const query = urlParams.get('query');
            const categoryKey = urlParams.get('category');

            if (searchResults && query) {
                searchProducts(query, searchResults);
            } else if (productContainer && categoryKey) {
                displayProductsByCategory(categoryKey);
            } else if (productContainer) {
                displayAllProducts();
            }
        })
        .catch(error => console.error('Ошибка загрузки JSON:', error));
    updateCartCount();
});


// --- Страница Личный кабинет (dashboard.html) --- //
document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('auth-form');
    const loginInput = document.getElementById('login');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const authMessage = document.getElementById('auth-message');
    const userPanel = document.getElementById('user-panel');
    const usernameDisplay = document.getElementById('username-display');

    // Регистрация
    const registerForm = document.getElementById('register-form');
    const registerMessage = document.getElementById('register-message');

    function showUserPanel(username) {
        const users = JSON.parse(localStorage.getItem('users')) || {};
        const user = users[username] || {};
        const fio = user.fio || username;

        if (authForm) authForm.style.display = 'none';
        if (userPanel) userPanel.style.display = 'flex';
        if (usernameDisplay) usernameDisplay.textContent = fio;

        const loginEl = document.getElementById('user-login');
        const phoneEl = document.getElementById('user-phone');
        const emailEl = document.getElementById('user-email');

        if (loginEl) loginEl.textContent = username;
        if (phoneEl) phoneEl.textContent = user.phone || '';
        if (emailEl) emailEl.textContent = user.email || '';

        if (authMessage) authMessage.textContent = '';

        const purchaseList = document.getElementById('purchase-list');
        purchaseList.innerHTML = '';

        if (user.purchases && user.purchases.length > 0) {
            user.purchases.forEach(purchase => {
                const totalCost = purchase.items.reduce((sum, item) => {
                    return sum + (item.count * item.price);
                }, 0);

                const entry = document.createElement('li');
                entry.className = 'purchase-entry';
                entry.innerHTML = `
                <div class="purchase-date">Дата: ${purchase.date}</div>
                <ul class="purchase-items">
                    ${purchase.items.map(item => `
                        <li>${item.name} — ${item.count} шт. × ${item.price} = ${item.count * item.price} ₽</li>
                    `).join('')}
                </ul>
                <div class="purchase-total">Общая стоимость: ${totalCost} ₽</div>
            `;
                purchaseList.appendChild(entry);
            });
        } else {
            purchaseList.innerHTML = '<li class="purchase-entry">Покупки отсутствуют</li>';
        }
    }


    // Проверка, есть ли вошедший пользователь
    function checkLoggedIn() {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) {
            showUserPanel(loggedInUser);
        }
    }

    // Авторизация
    if (authForm && loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();

            if (!authForm.checkValidity()) {
                authForm.reportValidity();
                return;
            }

            const login = loginInput.value.trim();
            const password = passwordInput.value.trim();
            const users = JSON.parse(localStorage.getItem('users')) || {};

            if (users[login] && users[login].password === password) {
                localStorage.setItem('loggedInUser', login);
                showUserPanel(login);
            } else {
                authMessage.style.color = '#cc4444';
                authMessage.textContent = 'Неверный логин или пароль';
            }
        });
    }

    // Выход из аккаунта
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('loggedInUser');
            if (userPanel) userPanel.style.display = 'none';
            if (authForm) authForm.style.display = 'flex';
            loginInput.value = '';
            passwordInput.value = '';
            if (authMessage) authMessage.textContent = '';
        });
    }

    // Регистрация
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const login = document.getElementById('reg-login').value.trim();
            const fio = document.getElementById('reg-fio').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const phone = document.getElementById('reg-phone').value.trim();
            const password = document.getElementById('reg-password').value.trim();
            const confirm = document.getElementById('reg-confirm').value.trim();

            if (!login || !fio || !email || !phone || !password || !confirm) {
                registerMessage.style.color = 'red';
                registerMessage.textContent = 'Пожалуйста, заполните все поля.';
                return;
            }

            if (password !== confirm) {
                registerMessage.style.color = 'red';
                registerMessage.textContent = 'Пароли не совпадают.';
                return;
            }

            let users = JSON.parse(localStorage.getItem('users')) || {};

            if (users[login]) {
                registerMessage.style.color = 'red';
                registerMessage.textContent = 'Пользователь с таким логином уже существует.';
                return;
            }

            users[login] = {
                password: password,
                email: email,
                phone: phone,
                fio: fio
            };

            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('loggedInUser', login);

            registerMessage.style.color = 'green';
            registerMessage.textContent = 'Регистрация успешна! Перенаправляем...';

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        });
    }

    checkLoggedIn();
});


// --- Кнопка "В корзину [n шт]" с - и + --- //
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCart(product, delta = 1) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.count += delta;
        if (existingItem.count <= 0) {
            cart.splice(cart.indexOf(existingItem), 1);
        }
    } else if (delta > 0) {
        cart.push({ ...product, count: 1 });
    }

    saveCart(cart);
}


// --- Добавить товар в корзину --- //
document.addEventListener('click', function (e) {

    if (e.target.classList.contains('add-to-cart')) {
        const button = e.target;

        if (button.classList.contains('in-cart')) return;

        const card = button.closest('.card');
        const product = {
            id: card.dataset.id,
            name: card.querySelector('h3').textContent,
            price: parseInt(card.querySelector('.price').textContent.replace(/[^\d]/g, '')),
            image: card.querySelector('img').src
        };
        updateCart(product, 1);
        updateCartCount();

        button.classList.add('in-cart');
        button.innerHTML = '';
        const minusBtn = document.createElement('button');
        minusBtn.className = 'minus-cart';
        minusBtn.textContent = '-';

        const label = document.createElement('button');
        label.className = 'cart-label';
        label.innerHTML = `В корзине <span class="cart-count">1</span> шт<br>перейти`;

        const plusBtn = document.createElement('button');
        plusBtn.className = 'plus-cart';
        plusBtn.textContent = '+';

        button.appendChild(minusBtn);
        button.appendChild(label);
        button.appendChild(plusBtn);
    }

    // Увеличить количество
    if (e.target.classList.contains('plus-cart')) {
        const button = e.target.closest('.add-to-cart');
        const countSpan = button.querySelector('.cart-count');
        let count = parseInt(countSpan.textContent);
        count++;
        countSpan.textContent = count;
        const card = button.closest('.card');
        const product = {
            id: card.dataset.id,
            name: card.querySelector('h3').textContent,
            price: parseInt(card.querySelector('.price').textContent.replace(/[^\d]/g, '')),
            image: card.querySelector('img').src
        };
        updateCart(product, 1);
        updateCartCount();
    }

    // Уменьшить количество
    if (e.target.classList.contains('minus-cart')) {
        const button = e.target.closest('.add-to-cart');
        const countSpan = button.querySelector('.cart-count');
        let count = parseInt(countSpan.textContent);
        if (count > 1) {
            count--;
            countSpan.textContent = count;
            const card = button.closest('.card');
            const product = {
                id: card.dataset.id,
                name: card.querySelector('h3').textContent,
                price: parseInt(card.querySelector('.price').textContent.replace(/[^\d]/g, '')),
                image: card.querySelector('img').src
            };
            updateCart(product, -1);
            updateCartCount();
        } else {
            button.classList.remove('in-cart');
            button.innerHTML = `
                В корзину
                <img src="../images/icons/icon-cart2.png" alt="Корзина" class="cart-icon">
            `;
            updateCartCount();
        }
    }

    // Переход на страницу корзины
    if (e.target.classList.contains('cart-label')) {
        window.location.href = 'cart.html';
    }

});


// --- Отображение товаров в корзине --- //
document.addEventListener('DOMContentLoaded', function () {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalContainer = document.getElementById('cart-total');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const checkoutBtn = document.createElement('button');

    function displayCart() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cartItemsContainer.innerHTML = '';
        cartTotalContainer.innerHTML = '';

        const oldClearBtn = document.getElementById('clear-cart-btn');
        if (oldClearBtn) oldClearBtn.remove();

        cartItemsContainer.innerHTML = '';
        cartTotalContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Ваша корзина пуста</p>';
            checkoutBtn.style.display = 'none';
            return;
        }

        let totalPrice = 0;

        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.dataset.id = item.id;
            itemElement.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
        <div class="cart-item-info">
            <h3>${item.name}</h3>
            ${item.description ? `<p>${item.description}</p>` : ''}
            <p class="cart-item-price">${item.price.toLocaleString()} сум</p>
            <p class="cart-item-quantity">Количество: <span class="cart-item-count">${item.count}</span></p>
            <p class="cart-item-total">Итого: ${(item.price * item.count).toLocaleString()} сум</p>
        </div>
        <div class="quantity-controls">
            <button class="minus-cart">-</button>
            <button class="plus-cart">+</button>
            <button class="remove-item-btn">
                <img class="icon-trash" src="../images/icons/icon-trash.png" alt="Удалить">
            </button>
        </div>
        `;
            cartItemsContainer.appendChild(itemElement);
            totalPrice += item.price * item.count;
        });

        const totalElement = document.createElement('div');
        totalElement.className = 'cart-total';
        totalElement.innerHTML = `<p>Общая стоимость: ${totalPrice.toLocaleString()} сум</p>`;
        cartItemsContainer.appendChild(totalElement);

        // Кнопка "Оформить заказ"
        checkoutBtn.className = 'checkout-btn';
        checkoutBtn.textContent = 'Оформить заказ';
        cartItemsContainer.appendChild(checkoutBtn);

        // Кнопка "Очистить всё"
        const clearCartBtn = document.createElement('button');
        clearCartBtn.className = 'clear-btn';
        clearCartBtn.id = 'clear-cart-btn';
        clearCartBtn.textContent = 'Очистить всё';
        clearCartBtn.addEventListener('click', () => {
            localStorage.removeItem('cart');
            displayCart();
            updateCartCount();
        });
        cartItemsContainer.prepend(clearCartBtn);

        checkoutBtn.addEventListener('click', function () {
            window.location.href = 'order.html';
        });
        updateCartCount();
    }

    // Функция для очистки корзины
    clearCartBtn.addEventListener('click', () => {
        localStorage.removeItem('cart');
        displayCart();
    });

    // Обработчик событий для динамических кнопок + и -
    cartItemsContainer.addEventListener('click', function (e) {
        const productId = e.target.closest('.cart-item')?.dataset.id;
        if (!productId) return;

        // Увеличить количество
        if (e.target.classList.contains('plus-cart')) {
            updateItemCount(productId, 1);
        }

        // Уменьшить количество
        if (e.target.classList.contains('minus-cart')) {
            updateItemCount(productId, -1);
        }

        // Удалить товар из корзины
        if (e.target.closest('.remove-item-btn')) {
            removeItemFromCart(productId);
        }
    });

    // Функция для обновления количества товара в корзине
    function updateItemCount(productId, delta) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const item = cart.find(item => item.id === productId);

        if (item) {
            item.count += delta;
            if (item.count <= 0) {
                cart = cart.filter(i => i.id !== productId);
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            displayCart();
        }
    }

    // Функция для удаления товара из корзины
    function removeItemFromCart(productId) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCart();
    }

    displayCart();
    updateCartCount();
});



// --- Оформление заказа --- //
document.addEventListener('DOMContentLoaded', () => {
    const orderForm = document.getElementById('order-form');
    if (!orderForm) {
        console.error('Форма с id="order-form" не найдена');
        return;
    }

    orderForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            alert('Ваша корзина пуста!');
            return;
        }

        savePurchase(cart);

        localStorage.removeItem('cart');
        alert('Спасибо за заказ! После оплаты мы свяжемся с вами.');
        window.open('https://click.uz/ru/payments', '_blank');
        window.location.href = '../index.html';

    });
});



// --- Счётчик покупок в корзине --- //
function updateCartCount() {
    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + item.count, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.count * item.price, 0);

    const cartCountElem = document.getElementById('cart-count');
    const cartTotalElem = document.getElementById('cart-total-amount');

    if (cartCountElem) {
        cartCountElem.textContent = totalCount;
    }

    if (cartTotalElem) {
        cartTotalElem.textContent = totalPrice.toLocaleString() + ' сум';
    }
}


// --- Сохранять покупки в профиле пользователя --- //
function savePurchase(cartItems) {
    const username = localStorage.getItem('loggedInUser');
    if (!username) return;

    const users = JSON.parse(localStorage.getItem('users')) || {};
    const user = users[username];

    const purchase = {
        items: cartItems,
        date: new Date().toLocaleString()
    };

    if (!user.purchases) {
        user.purchases = [];
    }

    user.purchases.push(purchase);
    users[username] = user;
    localStorage.setItem('users', JSON.stringify(users));
}


// --- Функция для открытия модального окна --- //
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('productModal');
    const closeButton = document.querySelector('#productModal .close-button');

    if (!modal || !closeButton) {
        console.error('Модалка или кнопка закрытия не найдены');
        return;
    }

    // Закрытие по крестику
    closeButton.addEventListener('click', () => {
        console.log('Клик по крестику'); // для проверки
        modal.classList.remove('show');
        modal.classList.add('hidden');
    });

    // Закрытие по клику вне окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            console.log('Клик вне модального окна'); // для проверки
            modal.classList.remove('show');
            modal.classList.add('hidden');
        }
    });
});

// Открытие модального окна
function openProductModal(product) {
    const modal = document.getElementById('productModal');
    if (!modal) return;

    document.getElementById('modalImage').src = product.image;
    document.getElementById('modalTitle').textContent = product.name;
    document.getElementById('modalDescription').textContent = product.description;
    document.getElementById('modalPrice').textContent = product.price.toLocaleString();

    modal.classList.remove('hidden');
    modal.classList.add('show');
}
const products = [
    {
        barcode: "132900000001",
        name: "Coca-Cola 1L",
        category: "Bebidas",
        price: 8.99,
        image: "new-products/coca-cola.webp"
    },
    {
        barcode: "132900000002",
        name: "Oleo de Soja",
        category: "Mercado",
        price: 7.49,
        image: "new-products/oleo-de-soja.webp"
    },
    {
        barcode: "132900000003",
        name: "Pringles Original",
        category: "Salgadinhos",
        price: 12.9,
        image: "new-products/pringles.webp"
    },
    {
        barcode: "132900000004",
        name: "Chocolate Lacta Oreo",
        category: "Doces",
        price: 6.99,
        image: "new-products/chocolate-lacta-oreo.webp"
    },
    {
        barcode: "132900000005",
        name: "Leite Integral 1L",
        category: "Laticinios",
        price: 5.89,
        image: "new-products/leite.webp"
    }
];

const loginScreen = document.getElementById("loginScreen");
const app = document.getElementById("app");
const showLogin = document.getElementById("showLogin");
const showRegister = document.getElementById("showRegister");
const authTitle = document.getElementById("authTitle");
const authMessage = document.getElementById("authMessage");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const welcomeText = document.getElementById("welcomeText");
const loggedUser = document.getElementById("loggedUser");
const logoutBtn = document.getElementById("logoutBtn");
const productsList = document.getElementById("productsList");
const cartItems = document.getElementById("cartItems");
const subtotal = document.getElementById("subtotal");
const total = document.getElementById("total");
const clearCart = document.getElementById("clearCart");
const checkoutBtn = document.getElementById("checkoutBtn");
const scanButton = document.getElementById("scanButton");
const scannerModal = document.getElementById("scannerModal");
const closeScanner = document.getElementById("closeScanner");

let cart = [];
let scanner = null;
let scanning = false;

async function apiRequest(url, method = "GET", data = null) {
    const options = {
        method,
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "same-origin"
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Request failed.");
    }

    return result;
}

function setAuthMessage(message, type = "info") {
    authMessage.textContent = message;
    authMessage.className = `auth-message ${type}`;
}

function switchAuthMode(mode) {
    const isLogin = mode === "login";

    loginForm.classList.toggle("hidden", !isLogin);
    registerForm.classList.toggle("hidden", isLogin);
    showLogin.classList.toggle("active", isLogin);
    showRegister.classList.toggle("active", !isLogin);
    authTitle.textContent = isLogin ? "Entrar na conta" : "Criar nova conta";
    setAuthMessage("");
}

function showApp(user) {
    loginScreen.classList.add("hidden");
    app.classList.remove("hidden");
    welcomeText.textContent = `Bem-vindo, ${user.username}`;
    loggedUser.textContent = user.username;
}

function showAuth() {
    app.classList.add("hidden");
    loginScreen.classList.remove("hidden");
    loggedUser.textContent = "Usuario";
    welcomeText.textContent = "Bem-vindo";
}

async function checkCurrentUser() {
    try {
        const result = await apiRequest("/user");
        showApp(result.user);
    } catch (error) {
        showAuth();
    }
}

showLogin.addEventListener("click", () => switchAuthMode("login"));
showRegister.addEventListener("click", () => switchAuthMode("register"));

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = loginForm.username.value.trim();
    const password = loginForm.password.value;

    if (!username || !password) {
        setAuthMessage("Preencha usuario e senha.", "error");
        return;
    }

    try {
        setAuthMessage("Entrando...", "info");
        const result = await apiRequest("/login", "POST", { username, password });
        loginForm.reset();
        showApp(result.user);
        showNotification("Login realizado com sucesso");
    } catch (error) {
        setAuthMessage(error.message, "error");
    }
});

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = registerForm.username.value.trim();
    const password = registerForm.password.value;

    if (!username || !password) {
        setAuthMessage("Preencha usuario e senha.", "error");
        return;
    }

    try {
        setAuthMessage("Criando conta...", "info");
        const result = await apiRequest("/register", "POST", { username, password });
        registerForm.reset();
        showApp(result.user);
        showNotification("Conta criada com sucesso");
    } catch (error) {
        setAuthMessage(error.message, "error");
    }
});

logoutBtn.addEventListener("click", async () => {
    try {
        await apiRequest("/logout", "POST");
    } finally {
        cart = [];
        renderCart();
        showAuth();
        showNotification("Sessao encerrada");
    }
});

function formatCurrency(value) {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function renderProducts() {
    productsList.innerHTML = "";

    products.forEach((product, index) => {
        productsList.innerHTML += `
            <div class="product-card">
                <div class="product-left">
                    <img src="${product.image}" alt="${product.name}" loading="lazy" decoding="async">
                    <div>
                        <h3>${product.name}</h3>
                        <span>${product.category}</span>
                    </div>
                </div>

                <div class="product-actions">
                    <div class="product-price">${formatCurrency(product.price)}</div>
                    <button class="add-btn" onclick="addToCart(${index})" type="button">
                        Adicionar
                    </button>
                </div>
            </div>
        `;
    });
}

function addToCart(index) {
    const product = products[index];

    cart.push(product);
    renderCart();
    showNotification(`${product.name} adicionado`);
}

function renderCart() {
    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = "<div class=\"empty-cart\">Carrinho vazio</div>";
    }

    let totalValue = 0;

    cart.forEach((item, index) => {
        totalValue += item.price;

        cartItems.innerHTML += `
            <div class="cart-item">
                <div>
                    <strong>${item.name}</strong>
                    <span>${item.category}</span>
                </div>

                <div class="cart-item-actions">
                    <strong>${formatCurrency(item.price)}</strong>
                    <button onclick="removeItem(${index})" class="icon-btn danger" type="button" aria-label="Remover ${item.name}">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>
        `;
    });

    subtotal.textContent = formatCurrency(totalValue);
    total.textContent = formatCurrency(totalValue);
}

function removeItem(index) {
    const removed = cart[index];

    cart.splice(index, 1);
    renderCart();
    showNotification(`${removed.name} removido`);
}

clearCart.addEventListener("click", () => {
    cart = [];
    renderCart();
    showNotification("Carrinho limpo");
});

checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
        showNotification("Carrinho vazio");
        return;
    }

    showNotification("Compra finalizada");
    cart = [];
    renderCart();
});

scanButton.addEventListener("click", () => {
    if (scanning) {
        return;
    }

    if (!window.Html5Qrcode) {
        showNotification("Biblioteca do scanner nao carregada");
        return;
    }

    scanning = true;
    scannerModal.style.display = "flex";
    scanner = new Html5Qrcode("reader");

    scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
            const found = products.find((product) => decodedText.startsWith(product.barcode));

            if (found) {
                addToCart(products.indexOf(found));
                showNotification(`${found.name} escaneado`);
            } else {
                showNotification("Produto nao encontrado");
            }

            stopScanner();
        }
    ).catch(() => {
        showNotification("Erro ao iniciar camera");
        scanning = false;
    });
});

function stopScanner() {
    if (scanner) {
        scanner.stop().catch(() => null).finally(() => {
            scanner.clear();
            scanner = null;
            scannerModal.style.display = "none";
            scanning = false;
        });
        return;
    }

    scannerModal.style.display = "none";
    scanning = false;
}

closeScanner.addEventListener("click", stopScanner);

function showNotification(text) {
    const notification = document.createElement("div");

    notification.classList.add("notification");
    notification.textContent = text;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add("show");
    }, 50);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

renderProducts();
renderCart();
checkCurrentUser();

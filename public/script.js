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

const STORAGE_KEYS = {
    users: "smart_cart_mock_users",
    session: "smart_cart_mock_session",
    cart: "smart_cart_cart"
};

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
const productSearch = document.getElementById("productSearch");
const productsList = document.getElementById("productsList");
const cartItems = document.getElementById("cartItems");
const subtotal = document.getElementById("subtotal");
const total = document.getElementById("total");
const clearCart = document.getElementById("clearCart");
const checkoutBtn = document.getElementById("checkoutBtn");
const scanButton = document.getElementById("scanButton");
const scannerModal = document.getElementById("scannerModal");
const closeScanner = document.getElementById("closeScanner");
const switchCamera = document.getElementById("switchCamera");
const cameraStatus = document.getElementById("cameraStatus");
const reader = document.getElementById("reader");

let cart = [];
let scannerStream = null;
let scannerFrame = 0;
let scanning = false;
let currentFacingMode = "user";
let availableCameraCount = 0;

function readStorage(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        return fallback;
    }
}

function writeStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function normalizeUsername(username) {
    return String(username || "").trim().toLowerCase();
}

function validateCredentials(username, password) {
    if (!String(username || "").trim() || !String(password || "").trim()) {
        return "Preencha usuario e senha.";
    }

    if (String(username).trim().length < 3) {
        return "Usuario deve ter pelo menos 3 caracteres.";
    }

    if (String(password).length < 6) {
        return "Senha deve ter pelo menos 6 caracteres.";
    }

    return "";
}

function getUsers() {
    return readStorage(STORAGE_KEYS.users, []);
}

function saveUsers(users) {
    writeStorage(STORAGE_KEYS.users, users);
}

function findUser(username) {
    return getUsers().find((user) => user.username === normalizeUsername(username));
}

function createSession(user) {
    const sessionUser = {
        id: user.id,
        username: user.username
    };

    writeStorage(STORAGE_KEYS.session, sessionUser);
    return sessionUser;
}

function getCurrentUser() {
    return readStorage(STORAGE_KEYS.session, null);
}

function clearSession() {
    localStorage.removeItem(STORAGE_KEYS.session);
}

function registerLocalUser(username, password) {
    const validationError = validateCredentials(username, password);

    if (validationError) {
        throw new Error(validationError);
    }

    const users = getUsers();
    const normalizedUsername = normalizeUsername(username);

    if (users.some((user) => user.username === normalizedUsername)) {
        throw new Error("Este usuario ja esta cadastrado.");
    }

    const user = {
        id: Date.now(),
        username: normalizedUsername,
        password,
        createdAt: new Date().toISOString()
    };

    users.push(user);
    saveUsers(users);

    return createSession(user);
}

function loginLocalUser(username, password) {
    if (!String(username || "").trim() || !String(password || "").trim()) {
        throw new Error("Preencha usuario e senha.");
    }

    const user = findUser(username);

    if (!user || user.password !== password) {
        throw new Error("Usuario ou senha invalidos.");
    }

    return createSession(user);
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
    cart = loadCart();
    renderCart();
}

function showAuth() {
    app.classList.add("hidden");
    loginScreen.classList.remove("hidden");
    loggedUser.textContent = "Usuario";
    welcomeText.textContent = "Bem-vindo";
}

function checkCurrentUser() {
    const user = getCurrentUser();

    if (user) {
        showApp(user);
        return;
    }

    showAuth();
}

showLogin.addEventListener("click", () => switchAuthMode("login"));
showRegister.addEventListener("click", () => switchAuthMode("register"));

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const username = loginForm.username.value.trim();
    const password = loginForm.password.value;

    try {
        setAuthMessage("Entrando...", "info");
        const user = loginLocalUser(username, password);
        loginForm.reset();
        showApp(user);
        showNotification("Login realizado com sucesso");
    } catch (error) {
        setAuthMessage(error.message, "error");
    }
});

registerForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const username = registerForm.username.value.trim();
    const password = registerForm.password.value;

    try {
        setAuthMessage("Criando conta...", "info");
        const user = registerLocalUser(username, password);
        registerForm.reset();
        showApp(user);
        showNotification("Conta criada com sucesso");
    } catch (error) {
        setAuthMessage(error.message, "error");
    }
});

logoutBtn.addEventListener("click", () => {
    clearSession();
    cart = [];
    saveCart();
    renderCart();
    showAuth();
    showNotification("Sessao encerrada");
});

function formatCurrency(value) {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function loadCart() {
    const savedCart = readStorage(STORAGE_KEYS.cart, []);

    return savedCart
        .map((barcode) => products.find((product) => product.barcode === barcode))
        .filter(Boolean);
}

function saveCart() {
    writeStorage(STORAGE_KEYS.cart, cart.map((item) => item.barcode));
}

function getFilteredProducts() {
    const searchTerm = productSearch.value.trim().toLowerCase();

    if (!searchTerm) {
        return products;
    }

    return products.filter((product) => product.name.toLowerCase().includes(searchTerm));
}

function renderProducts() {
    productsList.innerHTML = "";
    const filteredProducts = getFilteredProducts();

    if (filteredProducts.length === 0) {
        productsList.innerHTML = "<div class=\"empty-products\">No products found</div>";
        return;
    }

    filteredProducts.forEach((product) => {
        const index = products.indexOf(product);

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

productSearch.addEventListener("input", renderProducts);

function addToCart(index) {
    const product = products[index];

    cart.push(product);
    saveCart();
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
                        <span class="ui-icon icon-close" aria-hidden="true"></span>
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
    saveCart();
    renderCart();
    showNotification(`${removed.name} removido`);
}

clearCart.addEventListener("click", () => {
    cart = [];
    saveCart();
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
    saveCart();
    renderCart();
});

function scannerIsSupported() {
    return "BarcodeDetector" in window && Boolean(navigator.mediaDevices?.getUserMedia);
}

function getCameraLabel() {
    return currentFacingMode === "user" ? "Camera frontal" : "Camera traseira";
}

function updateCameraControls() {
    cameraStatus.textContent = getCameraLabel();
    switchCamera.hidden = availableCameraCount <= 1;
    switchCamera.disabled = availableCameraCount <= 1;
}

async function updateAvailableCameras() {
    if (!navigator.mediaDevices?.enumerateDevices) {
        availableCameraCount = 0;
        updateCameraControls();
        return;
    }

    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        availableCameraCount = devices.filter((device) => device.kind === "videoinput").length;
    } catch (error) {
        availableCameraCount = 0;
    }

    updateCameraControls();
}

function stopCameraStream() {
    if (scannerFrame) {
        cancelAnimationFrame(scannerFrame);
        scannerFrame = 0;
    }

    if (scannerStream) {
        scannerStream.getTracks().forEach((track) => track.stop());
        scannerStream = null;
    }
}

async function getCameraStream(facingMode, allowFallback = false) {
    try {
        return await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode
            },
            audio: false
        });
    } catch (error) {
        if (!allowFallback) {
            throw error;
        }

        return navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });
    }
}

async function startCamera(facingMode, allowFallback = false) {
    stopCameraStream();
    currentFacingMode = facingMode;
    updateCameraControls();
    reader.textContent = `Abrindo ${getCameraLabel().toLowerCase()}...`;

    scannerStream = await getCameraStream(facingMode, allowFallback);

    await updateAvailableCameras();

    const video = document.createElement("video");
    const detector = new BarcodeDetector({
        formats: ["ean_13", "ean_8", "code_128", "qr_code"]
    });

    video.setAttribute("playsinline", "true");
    video.muted = true;
    video.classList.toggle("front-camera-preview", currentFacingMode === "user");
    video.srcObject = scannerStream;
    reader.replaceChildren(video);
    await video.play();
    scanVideoFrame(video, detector);
}

function getCameraErrorMessage(error) {
    if (error?.name === "NotAllowedError" || error?.name === "SecurityError") {
        return "Permissao da camera negada";
    }

    if (error?.name === "NotFoundError" || error?.name === "DevicesNotFoundError") {
        return "Nenhuma camera encontrada";
    }

    return "Erro ao iniciar camera";
}

scanButton.addEventListener("click", async () => {
    if (scanning) {
        return;
    }

    if (!scannerIsSupported()) {
        showNotification("Scanner indisponivel neste navegador");
        return;
    }

    scanning = true;
    currentFacingMode = "user";
    scannerModal.style.display = "flex";
    updateCameraControls();

    try {
        await startCamera(currentFacingMode, true);
    } catch (error) {
        showNotification(getCameraErrorMessage(error));
        stopScanner();
    }
});

switchCamera.addEventListener("click", async () => {
    if (!scanning || switchCamera.disabled) {
        return;
    }

    const previousFacingMode = currentFacingMode;
    const nextFacingMode = currentFacingMode === "user" ? "environment" : "user";

    switchCamera.disabled = true;

    try {
        await startCamera(nextFacingMode);
        showNotification(`${getCameraLabel()} ativada`);
    } catch (error) {
        showNotification(`${getCameraErrorMessage(error)}. Mantendo camera anterior`);

        try {
            await startCamera(previousFacingMode, true);
        } catch (restoreError) {
            showNotification(getCameraErrorMessage(restoreError));
            stopScanner();
        }
    } finally {
        switchCamera.disabled = availableCameraCount <= 1;
    }
});

async function scanVideoFrame(video, detector) {
    if (!scanning) {
        return;
    }

    try {
        const barcodes = await detector.detect(video);
        const code = barcodes[0]?.rawValue || "";
        const found = products.find((product) => code.startsWith(product.barcode));

        if (found) {
            addToCart(products.indexOf(found));
            showNotification(`${found.name} escaneado`);
            stopScanner();
            return;
        }
    } catch (error) {
        showNotification("Nao foi possivel ler o codigo");
        stopScanner();
        return;
    }

    scannerFrame = requestAnimationFrame(() => scanVideoFrame(video, detector));
}

function stopScanner() {
    stopCameraStream();
    reader.textContent = "";
    scannerModal.style.display = "none";
    scanning = false;
    currentFacingMode = "user";
    updateCameraControls();
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

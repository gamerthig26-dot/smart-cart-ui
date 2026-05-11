/* =========================
   PRODUTOS
========================= */

const products = [

    {
        barcode:"7891234567890",
        name:"Capinha iPhone 14",
        category:"Acessórios",
        price:39.90,
        image:"https://images.unsplash.com/photo-1512499617640-c74ae3a79d37"
    },

    {
        barcode:"7899991112223",
        name:"Película 3D",
        category:"Acessórios",
        price:24.90,
        image:"https://images.unsplash.com/photo-1580910051074-3eb694886505"
    },

    {
        barcode:"7897778889991",
        name:"Carregador Turbo",
        category:"Eletrônicos",
        price:89.90,
        image:"https://images.unsplash.com/photo-1583863788434-e58a36330cf0"
    }

];

/* =========================
   ELEMENTOS
========================= */

const loginScreen =
document.getElementById("loginScreen");

const app =
document.getElementById("app");

const loginBtn =
document.getElementById("loginBtn");

const userName =
document.getElementById("userName");

const welcomeText =
document.getElementById("welcomeText");

const productsList =
document.getElementById("productsList");

const cartItems =
document.getElementById("cartItems");

const subtotal =
document.getElementById("subtotal");

const total =
document.getElementById("total");

const clearCart =
document.getElementById("clearCart");

const checkoutBtn =
document.getElementById("checkoutBtn");

const scanButton =
document.getElementById("scanButton");

const scannerModal =
document.getElementById("scannerModal");

const closeScanner =
document.getElementById("closeScanner");

let cart = [];

/* =========================
   LOGIN
========================= */

loginBtn.addEventListener("click",()=>{

    if(userName.value.trim() === ""){

        showNotification(
            "Digite seu nome"
        );

        return;
    }

    loginScreen.classList.add("hidden");

    app.classList.remove("hidden");

    welcomeText.innerText =
        `Cliente: ${userName.value}`;

});

/* =========================
   RENDER PRODUTOS
========================= */

function renderProducts(){

    productsList.innerHTML = "";

    products.forEach((product,index)=>{

        productsList.innerHTML += `

            <div class="product-card">

                <div class="product-left">

                    <img src="${product.image}">

                    <div>

                        <h3>${product.name}</h3>

                        <span>${product.category}</span>

                    </div>

                </div>

                <div>

                    <div class="product-price">
                        R$ ${product.price.toFixed(2)}
                    </div>

                    <button
                        class="add-btn"
                        onclick="addToCart(${index})"
                    >
                        Adicionar
                    </button>

                </div>

            </div>

        `;
    });
}

/* =========================
   ADD CARRINHO
========================= */

function addToCart(index){

    const product = products[index];

    cart.push(product);

    renderCart();

    showNotification(
        `${product.name} adicionado`
    );
}

/* =========================
   RENDER CARRINHO
========================= */

function renderCart(){

    cartItems.innerHTML = "";

    if(cart.length === 0){

        cartItems.innerHTML = `
            <div class="empty-cart">
                Carrinho vazio
            </div>
        `;
    }

    let totalValue = 0;

    cart.forEach((item,index)=>{

        totalValue += item.price;

        cartItems.innerHTML += `

            <div class="cart-item">

                <div>

                    <strong>
                        ${item.name}
                    </strong>

                    <div>
                        ${item.category}
                    </div>

                </div>

                <div>

                    R$ ${item.price.toFixed(2)}

                    <button
                        onclick="removeItem(${index})"
                        class="clear-btn"
                        style="margin-top:10px;"
                    >
                        X
                    </button>

                </div>

            </div>

        `;
    });

    subtotal.innerText =
        `R$ ${totalValue.toFixed(2)}`;

    total.innerText =
        `R$ ${totalValue.toFixed(2)}`;
}

/* =========================
   REMOVER ITEM
========================= */

function removeItem(index){

    const removed =
    cart[index];

    cart.splice(index,1);

    renderCart();

    showNotification(
        `${removed.name} removido`
    );
}

/* =========================
   LIMPAR
========================= */

clearCart.addEventListener("click",()=>{

    cart = [];

    renderCart();

    showNotification(
        "Carrinho limpo"
    );

});

/* =========================
   FINALIZAR
========================= */

checkoutBtn.addEventListener("click",()=>{

    if(cart.length === 0){

        showNotification(
            "Carrinho vazio"
        );

        return;
    }

    showNotification(
        "Compra finalizada"
    );

    cart = [];

    renderCart();

});

/* =========================
   SCANNER
========================= */

scanButton.addEventListener("click",()=>{

    scannerModal.style.display =
        "flex";

    const scanner =
    new Html5Qrcode("reader");

    scanner.start(

        {
            facingMode:"environment"
        },

        {
            fps:10,
            qrbox:250
        },

        (decodedText)=>{

            const found =
            products.find(
                p => p.barcode === decodedText
            );

            if(found){

                addToCart(
                    products.indexOf(found)
                );

            }else{

                showNotification(
                    "Produto não encontrado"
                );

            }

            scanner.stop();

            scannerModal.style.display =
                "none";

        }

    );

});

/* =========================
   FECHAR SCANNER
========================= */

closeScanner.addEventListener("click",()=>{

    scannerModal.style.display =
        "none";

});

/* =========================
   NOTIFICAÇÃO
========================= */

function showNotification(text){

    const notification =
    document.createElement("div");

    notification.classList.add(
        "notification"
    );

    notification.innerText = text;

    document.body.appendChild(
        notification
    );

    setTimeout(()=>{

        notification.classList.add(
            "show"
        );

    },100);

    setTimeout(()=>{

        notification.remove();

    },3000);
}

/* INIT */

renderProducts();
renderCart();
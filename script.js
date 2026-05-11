/* =========================
   PRODUTOS
========================= */

const products = [

    {
        barcode:"132900000001",
        name:"Coca-Cola 1L",
        category:"Bebidas",
        price:8.99,
        image:"https://images.unsplash.com/photo-1629203851122-3726ecdf080e"
    },

    {
        barcode:"132900000002",
        name:"Óleo de Soja",
        category:"Mercado",
        price:7.49,
        image:"https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5"
    },

    {
        barcode:"132900000003",
        name:"Pringles Original",
        category:"Salgadinhos",
        price:12.90,
        image:"https://images.unsplash.com/photo-1585238342024-78d387f4a707"
    },

    {
        barcode:"132900000004",
        name:"Chocolate Lacta Oreo",
        category:"Doces",
        price:6.99,
        image:"https://images.unsplash.com/photo-1549007994-cb92caebd54b"
    },

    {
        barcode:"132900000005",
        name:"Leite Integral 1L",
        category:"Laticínios",
        price:5.89,
        image:"https://images.unsplash.com/photo-1550583724-b2692b85b150"
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

let scanning = false;

scanButton.addEventListener("click",()=>{

    /* EVITA ABRIR MÚLTIPLAS VEZES */

    if(scanning) return;

    scanning = true;

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

            /* IGNORA CHECKSUM FINAL EAN-13 */

            const found =
            products.find(
                p => decodedText.startsWith(p.barcode)
            );

            if(found){

                addToCart(
                    products.indexOf(found)
                );

                showNotification(
                    `${found.name} escaneado`
                );

            }else{

                showNotification(
                    "Produto não encontrado"
                );

            }

            /* PARA IMEDIATAMENTE */

            scanner.stop().then(()=>{

                scannerModal.style.display =
                    "none";

                scanning = false;

            });

        }

    ).catch(()=>{

        showNotification(
            "Erro ao iniciar câmera"
        );

        scanning = false;

    });

});

/* =========================
   FECHAR SCANNER
========================= */

closeScanner.addEventListener("click",()=>{

    scannerModal.style.display =
        "none";

    scanning = false;

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
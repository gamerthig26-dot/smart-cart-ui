# Smart Cart UI

Smart Cart UI is now a frontend-only static app. It keeps the original cart interface, product list, login/register screens, checkout flow, notifications, and scanner modal without routes, APIs, databases, or any server-side authentication.

## Project Structure

```text
smart-cart-ui/
  public/
    index.html           Static Smart Cart UI
    script.js            Local mock auth, products, cart, checkout, and browser scanner logic
    style.css            Responsive UI styles and local icons
    new-products/        Product images used by the cart
  package.json           Project metadata only; no runtime dependencies
```

## Run The App

Open this file directly in a browser:

```text
public/index.html
```

No server, API, database, install step, or external service is required.

## Local Mock Behavior

Registration and login are simulated in the browser with `localStorage`.

The app stores:

```text
smart_cart_mock_users      Mock users created in this browser
smart_cart_mock_session    Current logged-in mock user
smart_cart_cart            Current cart product barcodes
```

Products are static mock data declared in `public/script.js`, with images loaded from `public/new-products/`.

## Scanner

The scanner uses the browser-native `BarcodeDetector` and camera APIs when available. If the current browser does not support native barcode detection, the app stays functional and shows a notification that scanning is unavailable.

## Limitations

Because there is no backend, mock users and carts exist only in the current browser storage. Passwords are not secure credentials; they are local demo data. There is no server-side session, database persistence, remote sync, duplicate protection across devices, or real payment processing.

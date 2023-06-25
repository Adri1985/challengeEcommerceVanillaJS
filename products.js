let ruta = './';

const products = [];

let stockProducts = [];

// Routing
const routes = {
  '/': homeController,
  '/:modelo': productoController,
};

function homeController() {
  console.log("homeController")
  listProducts();
}

function productoController(params) {
  console.log("productController")
  const modelo = params.modelo;

  detail(modelo);
  //document.getElementById('home').innerHTML = `Renderizando el producto con modelo ${modelo}`;
}

async function detail(modelo) {
  let arr = modelo.split('-');
  const id = arr[0];
  console.log(arr);
  await getStockAndPrice(id);
  console.log("stockAndPrice", stockProducts);
  displayDetail(id);
  setTimeout(() => {
    detail(modelo);
  }, 5000); // Ejecuta la función detail nuevamente después de 5 segundos
}

async function getStockAndPrice(pid) {
  const URLJSON = ruta + `api/stockprice/${pid}`;
  try {
    const respuesta = await fetch(URLJSON);
    const data = await respuesta.json();
    console.log("data de stock", data);


    stockProducts = data;
    console.log("stockProducts1", stockProducts);
    console.log("price", stockProducts.stock_price[0].price);
  } catch (error) {
    console.error('Error al obtener los productos:', error);
  }
}

function displayDetail(pid) {
  const main = document.getElementById("home");
  const marca = products.find(el => el.id == pid).marca;
  const modelo = products.find(el => el.id == pid).modelo;
  console.log("marca", marca);
  console.log("modelo", modelo);

  main.innerHTML = ""; // Limpia el contenido actual de main

  const headerDiv = document.createElement("div");
  headerDiv.className = "header";
  const backDiv = document.createElement("div");
  backDiv.className = "menu-icon"
  const img = document.createElement("img");
  img.src = "./images/back.png";
  backDiv.appendChild(img);
  const dotsDiv = document.createElement("div");
  dotsDiv.className = "menu-icon"
  const dots = document.createElement("img");
  dots.src = "./images/dots.png";
  dotsDiv.appendChild(dots);
  const detailP = document.createElement("p")
  detailP.textContent = "Detail"
  let a = document.createElement("a")
  a.href = `/`
  a.className = "a"
  a.onclick = (handleLinkClick)
  a.appendChild(backDiv)

  headerDiv.appendChild(a);
  headerDiv.appendChild(detailP)
  headerDiv.appendChild(dotsDiv);
  main.appendChild(headerDiv);


  const detail = document.createElement("div");
  detail.className = "detail";
  const image = document.createElement("img");
  image.src = `./images/${marca} ${modelo}-img.png`;
  detail.appendChild(image);
  main.appendChild(detail);
  main.innerHTML = main.innerHTML +
    `<div class="header">
      <p class="model">${marca} ${modelo}</p>
      <p class="price">$${stockProducts.stock_price[0].price}</p>
    </div>
    <div class="header">
      <p class="data">Origin: Import  Stock: ${stockProducts.stock_price[0].stock}</p>
    </div>
    <div class="header desc-title">
      <p>Description</p>
    </div>
    <div class="description">
      <p>Selling imported beer in the US with nearly 60 million cases in annual sales,
        growing more than 15 million cases over the past 2 years. A fully
      </p>
    </div>
    <div class="header">
      <p>Size</p>
    </div>`
  const sizesDiv = document.createElement("div")
  sizesDiv.className = "header"
  for (const stockPrice of stockProducts.stock_price) {
    const sizeButton = document.createElement("button")
    sizeButton.textContent = `${stockPrice.size}`
    sizesDiv.appendChild(sizeButton)
  }
  main.appendChild(sizesDiv)
  main.innerHTML = main.innerHTML +
    `
    <div class="buttons">
      <div class="bag">
          <img src="./images/bag.png" alt="">
      </div>
      <button class="add"> Add to cart</button>
    </div>`
}

function handleRouteChange() {
  console.log("handle route change")
  const path = window.location.pathname;
  console.log(path)
  let matchedRoute = null;

  for (const route in routes) {
    //const routePattern = new RegExp(`^${route.replace(/:\w+/g, '(.+)')}$`);
    const routePattern = new RegExp(`^${route.replace(/:\w+/g, '([^/]+)')}$`);

    if (routePattern.test(path)) {
      matchedRoute = route;
      break;
    }
  }

  if (matchedRoute) {
    const params = extractParamsFromRoute(path, matchedRoute);
    routes[matchedRoute](params);
  } else {
    document.getElementById('products').innerHTML = 'Ruta no encontrada';
  }
}

function extractParamsFromRoute(path, route) {
  const paramNames = route.match(/:(\w+)/g) || [];
  const paramValues = path.match(new RegExp(`^${route.replace(/:\w+/g, '(.+)')}`)) || [];
  return paramNames.reduce((params, paramName, index) => {
    const key = paramName.slice(1);
    const value = paramValues[index + 1];
    params[key] = value;
    return params;
  }, {});
}

window.addEventListener('DOMContentLoaded', handleRouteChange);
window.addEventListener('popstate', handleRouteChange);
//window.onload(handleRouteChange)

function obtenerProductosJson() {
  const URLJSON = ruta + 'products.mock.json';
  fetch(URLJSON)
    .then((respuesta) => respuesta.json())
    .then((data) => {
      console.log("data", data);
      for (const producto of data.productos) {
        products.push(producto);
      }
      listProducts(products);
    })
    .catch((error) => {
      console.error('Error al obtener los productos:', error);
    });
}

function handleLinkClick(event) {
  console.log("handleClick", event.target)
  event.preventDefault(); // Evitar la recarga de la página

  const href = event.target.closest('a');
  console.log("href", href)
  history.pushState({}, '', href); // Actualizar la URL sin recargar la página
  handleRouteChange(); // Activar el cambio de ruta manualmente
}

obtenerProductosJson();

function listProducts(products) {
  let container = document.getElementById("products");
  container.innerHTML = '';
  let product;
  for (const producto of products) {
    let a = document.createElement("a")
    a.href = `/${producto.id}-${producto.marca}${producto.modelo}`
    a.className = "a"
    a.onclick = (handleLinkClick)
    let div = document.createElement("div");
    div.className = "container";
    let img = document.createElement("img");
    img.src = `./images/${producto.marca} ${producto.modelo}-img.png`;
    div.appendChild(img);
    let p1 = document.createElement("p");
    p1.className = "brand";
    p1.textContent = producto.marca;
    div.appendChild(p1);
    let p2 = document.createElement("p");
    p2.className = "model";
    p2.textContent = producto.modelo;
    div.appendChild(p2);
    let p3 = document.createElement("p");
    p3.className = "price";
    p3.textContent = `$${producto.precio}`;
    div.appendChild(p3);
    a.appendChild(div)
    container.appendChild(a)
  }
}

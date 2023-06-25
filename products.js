let ruta = "./";

const products = [];

let stockProducts = [];

let selectedPrice = 0;

// Routing
const routes = {
  "/": homeController,
  "/:modelo": productoController,
};

function homeController() {
  console.log("homeController");
  listProducts();
}

function productoController(params) {
  console.log("productController");
  const modelo = params.modelo;

  detail(modelo);
  //document.getElementById('home').innerHTML = `Renderizando el producto con modelo ${modelo}`;
}

async function detail(modelo) {
  let arr = modelo.split("-");
  const id = arr[0];
  console.log(arr);
  await getStockAndPrice(id);
  console.log("stockAndPrice", stockProducts);

  displayDetail(id);
  setTimeout(() => {
    detail(modelo);
  }, 50000); // Ejecuta la función detail nuevamente después de 5 segundos
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
    console.error("Error al obtener los productos:", error);
  }
}

function displayDetail(pid) {
  console.log(stockProducts);
  const main = document.getElementById("home");
  const marca = products.find((el) => el.id == pid).marca;
  const modelo = products.find((el) => el.id == pid).modelo;
  console.log("marca", marca);
  console.log("modelo", modelo);

  main.innerHTML = ""; // Limpia el contenido actual de main

  const headerDiv = document.createElement("div");
  headerDiv.className = "header";
  const backDiv = document.createElement("div");
  backDiv.className = "menu-icon";
  const img = document.createElement("img");
  img.src = "./images/back.png";
  backDiv.appendChild(img);
  const dotsDiv = document.createElement("div");
  dotsDiv.className = "menu-icon";
  const dots = document.createElement("img");
  dots.src = "./images/dots.png";
  dotsDiv.appendChild(dots);
  const detailP = document.createElement("p");
  detailP.textContent = "Detail";
  let a = document.createElement("a");
  a.href = `/`;
  a.className = "a";
  a.onclick = handleLinkClick;
  a.appendChild(backDiv);

  headerDiv.appendChild(a);
  headerDiv.appendChild(detailP);
  headerDiv.appendChild(dotsDiv);
  main.appendChild(headerDiv);

  const detail = document.createElement("div");
  detail.className = "detail";
  const image = document.createElement("img");
  image.src = `./images/${marca} ${modelo}-img.png`;
  detail.appendChild(image);
  main.appendChild(detail);
  main.innerHTML =
    main.innerHTML +
    `<div class="header">
      <p class="model">${marca} ${modelo}</p>
      <p class="price">$${
        stockProducts.stock_price[selectedPrice].price / 100
      }</p>
    </div>
    <div class="header">
      <p class="data">Origin: Import  Stock: ${
        stockProducts.stock_price[selectedPrice].stock
      }</p>
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
    </div>`;
  const sizesDiv = document.createElement("div");
  sizesDiv.className = "header";
  index = 0;
  for (const stockPrice of stockProducts.stock_price) {
    const sizeButton = document.createElement("button");
    sizeButton.textContent = `${stockPrice.size}`;
    if (selectedPrice == index) {
      sizeButton.className = "selected_size";
    } else {
      sizeButton.className = "no_selected_size";
    }
    sizeButton.id = index;
    sizeButton.type = "button";
    sizeButton.onclick = function (event) {
      handleChangeVariation(event, pid);
    };
    sizesDiv.appendChild(sizeButton);
    index++;
  }
  main.appendChild(sizesDiv);
  const buttonsDiv = document.createElement("div");
  buttonsDiv.className = "buttons";
  const bagDiv = document.createElement("div");
  bagDiv.className = "bag";
  const bagImage = document.createElement("img");
  bagImage.src = "./images/bag.png";
  bagDiv.appendChild(bagImage);
  buttonsDiv.appendChild(bagDiv);
  const addButton = document.createElement("button");
  addButton.className = "add";
  addButton.textContent = "Add to cart";
  buttonsDiv.appendChild(addButton);
  main.appendChild(buttonsDiv);
}

function handleChangeVariation(e, pid) {
  e.preventDefault();

  selectedPrice = e.srcElement.id;
  displayDetail(pid);
}
function handleRouteChange() {
  console.log("handle route change");
  const path = window.location.pathname;
  console.log(path);
  let matchedRoute = null;

  for (const route in routes) {
    //const routePattern = new RegExp(`^${route.replace(/:\w+/g, '(.+)')}$`);
    const routePattern = new RegExp(`^${route.replace(/:\w+/g, "([^/]+)")}$`);

    if (routePattern.test(path)) {
      matchedRoute = route;
      break;
    }
  }

  if (matchedRoute) {
    const params = extractParamsFromRoute(path, matchedRoute);
    routes[matchedRoute](params);
  } else {
    document.getElementById("products").innerHTML = "Ruta no encontrada";
  }
}

function extractParamsFromRoute(path, route) {
  const paramNames = route.match(/:(\w+)/g) || [];
  const paramValues =
    path.match(new RegExp(`^${route.replace(/:\w+/g, "(.+)")}`)) || [];
  return paramNames.reduce((params, paramName, index) => {
    const key = paramName.slice(1);
    const value = paramValues[index + 1];
    params[key] = value;
    return params;
  }, {});
}

window.addEventListener("DOMContentLoaded", handleRouteChange);
window.addEventListener("popstate", handleRouteChange);
//window.onload(handleRouteChange)

function obtenerProductosJson() {
  const URLJSON = ruta + "products.mock.json";
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
      console.error("Error al obtener los productos:", error);
    });
}

function handleLinkClick(event) {
  console.log("handleClick", event.target);
  event.preventDefault(); // Evitar la recarga de la página

  const href = event.target.closest("a");
  console.log("href", href);
  history.pushState({}, "", href); // Actualizar la URL sin recargar la página
  handleRouteChange(); // Activar el cambio de ruta manualmente
}

obtenerProductosJson();

function listProducts(products) {
  let container = document.getElementById("products");
  container.innerHTML = "";
  let product;
  for (const producto of products) {
    let a = document.createElement("a");
    a.href = `/${producto.id}-${producto.marca}${producto.modelo}`;
    a.className = "a";
    a.onclick = handleLinkClick;
    let div = document.createElement("div");
    div.className = "card";
    let title = document.createElement("p");
    title.textContent = `${producto.marca} ${producto.modelo}`;
    title.className = "card-title";
    let img = document.createElement("img");
    img.src = `./images/${producto.marca} ${producto.modelo}-img.png`;
    let cardFooter = document.createElement("div");
    cardFooter.className = "cardFooter";
    let price = document.createElement("p");
    price.textContent = producto.precio / 100;
    let add = document.createElement("div");
    add.innerHTML = "+";
    div.appendChild(title);
    div.appendChild(img);
    cardFooter.appendChild(price);
    cardFooter.appendChild(add);

    div.appendChild(cardFooter);
    a.appendChild(div);
    container.appendChild(a);
  }
}

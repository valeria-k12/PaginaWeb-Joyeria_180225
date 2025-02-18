async function cargarProductos() {
    try {
      const response = await fetch('/productos');
      const productos = await response.json(); 

      const carouselInner = document.querySelector('.carousel-inner');

  
      carouselInner.innerHTML = '';

    
      productos.forEach((producto, index) => {
        const isActive = index === 0 ? 'active' : ''; 
        const productoHTML = `
          <div class="carousel-item ${isActive}">
            <div class="row justify-content-center">
              <div class="col-md-4">
                <div class="card">
                  <img src="${producto.imagen}" class="d-block w-100" alt="Producto ${producto.id}">
                  <div class="card-body text-center">
                    <h5 class="card-title">${producto.nombre}</h5>
                    <p class="card-text">$${producto.precio}</p>
                    <button class="btn btn-gold" onclick="agregarAlCarrito('${producto.nombre}', ${producto.precio})">Comprar</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        carouselInner.innerHTML += productoHTML;
      });
    } catch (error) {
      console.error('Error al cargar los productos:', error);
    }
  }

  window.onload = cargarProductos;
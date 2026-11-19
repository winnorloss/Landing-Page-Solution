// Alerta360 · Menú principal
// El hover y el teclado (Tab) los resuelve el CSS; aquí solo va el botón Menú y la tecla Esc.
const menu = document.querySelector('.menu-principal');
const botonMenu = menu.querySelector('.menu-boton');

function cerrarMenu() {
  menu.classList.remove('abierta');
  botonMenu.setAttribute('aria-expanded', 'false');
}

// Botón Menú (pantallas pequeñas): muestra u oculta la lista
botonMenu.addEventListener('click', () => {
  const abierta = menu.classList.toggle('abierta');
  botonMenu.setAttribute('aria-expanded', String(abierta));
});

// Al elegir una opción, el menú se cierra
menu.querySelectorAll('.menu-lista a').forEach((enlace) => {
  enlace.addEventListener('click', cerrarMenu);
});

// Esc cierra el panel abierto (o la lista en el celular)
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const item = document.activeElement.closest('.menu-item') || menu.querySelector('.menu-item:hover');
  if (item) {
    item.classList.add('cerrado');
    if (item.contains(document.activeElement)) item.querySelector('.menu-enlace').focus();
  }
  cerrarMenu();
});

// El panel vuelve a abrirse normalmente cuando el cursor o el foco salen de la sección
menu.querySelectorAll('.menu-item').forEach((item) => {
  item.addEventListener('mouseleave', () => item.classList.remove('cerrado'));
  item.addEventListener('focusout', (e) => {
    if (!item.contains(e.relatedTarget)) item.classList.remove('cerrado');
  });
});

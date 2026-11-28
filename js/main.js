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


// =====================================================================
// HU-11 · Simulacro: seguir instrucciones numeradas de una en una
// =====================================================================
// Los pasos del simulacro. Para cambiar un texto o una imagen, edita aquí.
const pasosSimulacro = [
  {
    texto: 'Agáchate y cúbrete bajo una mesa firme',
    calma: '«Respira, vas bien. Un paso a la vez.»',
    imagen: '../assets/images/agachate-fondo.png',
    alt: 'Pictograma: persona agachada bajo una mesa'
  },
  {
    texto: 'Aléjate de las ventanas',
    calma: '«Muy bien. Sigue así.»',
    imagen: '../assets/images/alejate-fondo.png',
    alt: 'Pictograma: persona alejándose de una ventana'
  },
  {
    texto: 'Sal del edificio por la escalera',
    calma: '«Ya casi terminas. Sal con calma.»',
    imagen: '../assets/images/sal-fondo.png',
    alt: 'Pictograma: persona bajando una escalera hacia la salida'
  }
];

const panelPasos = document.querySelector('.pasos-simulacro');

if (panelPasos) {
  const tituloPaso = panelPasos.querySelector('h3');
  const barra = panelPasos.querySelector('.progreso');
  const barraRelleno = barra.querySelector('span');
  const imagenPaso = panelPasos.querySelector('.pictograma img');
  const textoPaso = panelPasos.querySelector('.paso-texto strong');
  const fraseCalma = panelPasos.querySelector('.instrucciones p');
  const botonAtras = document.getElementById('boton-atras');
  const botonSiguiente = document.getElementById('boton-siguiente');

  const total = pasosSimulacro.length;
  let pasoActual = 0;          // 0 = primer paso
  let terminado = false;

  function mostrarPaso() {
    const paso = pasosSimulacro[pasoActual];

    tituloPaso.textContent = `Paso ${pasoActual + 1} de ${total}`;
    textoPaso.textContent = paso.texto;
    fraseCalma.textContent = paso.calma;
    imagenPaso.src = paso.imagen;
    imagenPaso.alt = paso.alt;

    // Barra de progreso: visual y para el lector de pantalla
    barra.setAttribute('aria-valuenow', pasoActual + 1);
    barraRelleno.style.width = `${((pasoActual + 1) / total) * 100}%`;

    // CA04: en el primer paso no se puede retroceder; en el último se puede finalizar
    botonAtras.disabled = pasoActual === 0;
    // Si "Atrás" tenía el foco y se desactiva, el foco pasa a "Siguiente" (no se pierde)
    if (botonAtras.disabled && document.activeElement === botonAtras) botonSiguiente.focus();
    botonSiguiente.value = pasoActual === total - 1 ? 'Finalizar ✓' : 'Siguiente ▶';
  }

  function mostrarFinal() {
    terminado = true;
    tituloPaso.textContent = 'Simulacro completado';
    textoPaso.textContent = `Terminaste los ${total} pasos.`;
    fraseCalma.textContent = '«Lo hiciste muy bien.»';
    botonSiguiente.value = 'Repetir simulacro ↺';
    botonAtras.disabled = false;
  }

  // CA03: solo se avanza al pulsar el botón (sin saltos automáticos)
  botonSiguiente.addEventListener('click', () => {
    if (terminado) {             // "Repetir simulacro": vuelve al paso 1
      terminado = false;
      pasoActual = 0;
    } else if (pasoActual < total - 1) {
      pasoActual++;
    } else {                     // "Finalizar" en el último paso
      mostrarFinal();
      return;
    }
    mostrarPaso();
  });

  botonAtras.addEventListener('click', () => {
    if (terminado) {             // desde el final, vuelve al último paso
      terminado = false;
    } else if (pasoActual > 0) {
      pasoActual--;
    }
    mostrarPaso();
  });

  // Para el botón "Iniciar simulacro": vuelve al paso 1
  window.reiniciarSimulacro = function () {
    terminado = false;
    pasoActual = 0;
    mostrarPaso();
  };

  mostrarPaso();                 // CA01: al cargar, muestra "Paso 1 de 3"
}


// =====================================================================
// HU-17 · Mi perfil: elegir, probar y guardar mis preferencias
// =====================================================================
const CLAVE_PREFERENCIAS = 'alerta360-preferencias';

// Valores iniciales: los mismos que trae marcados el HTML
const PREFERENCIAS_INICIALES = {
  perfil: 'Auditivo',
  vibracion: true,
  luz: true,
  voz: false,
  texto: true,
  tamano: 20,        // px; 20 = tamaño normal de la página
  contraste: false
};

// Lee lo guardado en el navegador (si no hay nada o no se puede, usa los iniciales)
function leerPreferencias() {
  try {
    const guardado = localStorage.getItem(CLAVE_PREFERENCIAS);
    if (guardado) return { ...PREFERENCIAS_INICIALES, ...JSON.parse(guardado) };
  } catch (error) { /* almacenamiento bloqueado: se usan los valores iniciales */ }
  return { ...PREFERENCIAS_INICIALES };
}

// Lee un texto en voz alta, si el navegador lo permite
function leerEnVoz(texto) {
  if (!('speechSynthesis' in window)) return false;
  window.speechSynthesis.cancel();
  const voz = new SpeechSynthesisUtterance(texto);
  voz.lang = 'es-PE';
  voz.rate = 0.9;                    // un poco más lento, para entender mejor
  window.speechSynthesis.speak(voz);
  return true;
}

// Aplica a TODA la página las preferencias guardadas
function aplicarPreferenciasPagina(pref) {
  document.documentElement.style.setProperty('--tam-letra', `${(pref.tamano / 20) * 100}%`);
  document.documentElement.classList.toggle('alto-contraste', pref.contraste);
}

let preferenciasGuardadas = leerPreferencias();
aplicarPreferenciasPagina(preferenciasGuardadas);

const perfil = document.getElementById('mi-perfil');

if (perfil) {
  const controles = {
    vibracion: document.getElementById('sw-vibracion'),
    luz: document.getElementById('sw-luz'),
    voz: document.getElementById('sw-voz'),
    texto: document.getElementById('sw-texto'),
    tamano: document.getElementById('tamano-letra'),
    contraste: document.getElementById('sw-contraste')
  };
  const botonProbar = perfil.querySelector('.botones input:not(.boton-principal):not(#boton-restablecer)');
  const botonGuardar = perfil.querySelector('.botones .boton-principal');
  const botonRestablecer = document.getElementById('boton-restablecer');

  const vistaPrevia = document.getElementById('vista-previa-simulacro');
  const telefono = vistaPrevia.querySelector('.telefono');
  const instruccionVista = vistaPrevia.querySelector('.vista-previa-salir');
  const botonEscuchar = vistaPrevia.querySelector('.telefono input[type="button"]');

  // Mensaje de estado (el lector de pantalla lo anuncia solo)
  const mensaje = document.createElement('p');
  mensaje.className = 'mensaje-perfil';
  mensaje.setAttribute('role', 'status');
  perfil.querySelector('.botones').after(mensaje);

  function avisar(texto) { mensaje.textContent = texto; }

  // ----- 1. Perfil rápido: Auditivo, Visual, Cognitivo, Combinado -----
  // Cada perfil activa de una vez los canales que más le sirven
  const CANALES_POR_PERFIL = {
    Auditivo:  { vibracion: true, luz: true,  voz: false, texto: true },
    Visual:    { vibracion: true, luz: false, voz: true,  texto: false },
    Cognitivo: { vibracion: true, luz: false, voz: true,  texto: true },
    Combinado: { vibracion: true, luz: true,  voz: true,  texto: true }
  };
  const grupoPerfiles = perfil.querySelector('.perfil-config .tarjetas');
  const tarjetasPerfil = [...grupoPerfiles.querySelectorAll('.tarjeta')];

  // Para teclado y lector de pantalla: funcionan como opciones de radio
  grupoPerfiles.setAttribute('role', 'radiogroup');
  grupoPerfiles.setAttribute('aria-label', 'Perfil rápido');

  function nombrePerfil(tarjeta) { return tarjeta.querySelector('h3').textContent.trim(); }

  function marcarPerfil(nombre) {
    tarjetasPerfil.forEach((tarjeta) => {
      const elegida = nombrePerfil(tarjeta) === nombre;
      tarjeta.classList.toggle('seleccionada', elegida);
      tarjeta.setAttribute('aria-checked', String(elegida));
      tarjeta.tabIndex = elegida ? 0 : -1;   // Tab entra al grupo por la opción elegida
    });
  }

  function elegirPerfil(tarjeta) {
    const nombre = nombrePerfil(tarjeta);
    marcarPerfil(nombre);
    const canales = CANALES_POR_PERFIL[nombre];
    Object.keys(canales).forEach((canal) => { controles[canal].checked = canales[canal]; });
    actualizarVistaPrevia();
    avisar(`Perfil ${nombre}: se activaron sus canales. Puedes ajustarlos uno por uno.`);
  }

  tarjetasPerfil.forEach((tarjeta, i) => {
    tarjeta.setAttribute('role', 'radio');
    tarjeta.addEventListener('click', () => elegirPerfil(tarjeta));
    tarjeta.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        elegirPerfil(tarjeta);
        return;
      }
      // Flechas: pasan a la opción vecina y la eligen (como los radios nativos)
      const paso = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!paso) return;
      e.preventDefault();
      const vecina = tarjetasPerfil[(i + paso + tarjetasPerfil.length) % tarjetasPerfil.length];
      elegirPerfil(vecina);
      vecina.focus();
    });
  });

  // Lo que el usuario tiene marcado ahora (aunque no lo haya guardado)
  function leerControles() {
    const elegida = tarjetasPerfil.find((t) => t.classList.contains('seleccionada'));
    return {
      perfil: elegida ? nombrePerfil(elegida) : PREFERENCIAS_INICIALES.perfil,
      vibracion: controles.vibracion.checked,
      luz: controles.luz.checked,
      voz: controles.voz.checked,
      texto: controles.texto.checked,
      tamano: Number(controles.tamano.value),
      contraste: controles.contraste.checked
    };
  }

  function ponerControles(pref) {
    marcarPerfil(pref.perfil);
    controles.vibracion.checked = pref.vibracion;
    controles.luz.checked = pref.luz;
    controles.voz.checked = pref.voz;
    controles.texto.checked = pref.texto;
    controles.tamano.value = pref.tamano;
    controles.contraste.checked = pref.contraste;
  }

  // CA02: la vista previa refleja los cambios ANTES de guardarlos
  function actualizarVistaPrevia() {
    const pref = leerControles();
    // Tamaño relativo a lo ya aplicado en la página, para no ampliarlo dos veces
    vistaPrevia.style.setProperty('--escala-vista', pref.tamano / preferenciasGuardadas.tamano);
    vistaPrevia.classList.toggle('alto-contraste', pref.contraste);
    instruccionVista.innerHTML = pref.texto
      ? '<strong>SALIR</strong><br>de forma segura'
      : 'Sal del edificio con calma por la escalera y dirígete a la zona segura más cercana.';
    controles.tamano.setAttribute('aria-valuetext', `${pref.tamano} píxeles`);
  }

  Object.values(controles).forEach((control) => {
    control.addEventListener('input', actualizarVistaPrevia);
    control.addEventListener('change', actualizarVistaPrevia);
  });

  // Reproducción voluntaria de audio: "▶ Escuchar" lee el aviso de ejemplo
  botonEscuchar.addEventListener('click', () => {
    const texto = `Alerta oficial. Sismo. Gravedad alta. ${instruccionVista.textContent}`;
    if (!leerEnVoz(texto)) avisar('Tu navegador no puede leer el aviso en voz alta.');
  });

  // "Probar configuración": simula el aviso con los canales elegidos
  botonProbar.addEventListener('click', () => {
    const pref = leerControles();
    const probados = [];

    if (pref.vibracion) {
      if ('vibrate' in navigator && navigator.vibrate([400, 200, 400])) probados.push('vibración');
      else probados.push('vibración (no disponible en este dispositivo)');
    }
    if (pref.luz) {
      probados.push('destellos de luz');
      const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      // Como máximo 1 destello por segundo (WCAG 2.3.1 permite hasta 3)
      const veces = sinMovimiento ? 1 : 3;
      for (let i = 0; i < veces; i++) {
        setTimeout(() => telefono.classList.add('destello'), i * 1000);
        setTimeout(() => telefono.classList.remove('destello'), i * 1000 + 500);
      }
    }
    if (pref.voz) {
      const texto = `Alerta oficial. Sismo. Gravedad alta. ${instruccionVista.textContent}`;
      probados.push(leerEnVoz(texto) ? 'voz' : 'voz (no disponible en este navegador)');
    }
    if (pref.texto) probados.push('texto fácil');

    avisar(probados.length
      ? `Prueba en curso: ${probados.join(', ')}. Si te sirve, pulsa Guardar.`
      : 'No elegiste ningún canal. Activa al menos uno para recibir avisos.');
  });

  // CA03 y CA04: guardar en este navegador o avisar si no se puede
  botonGuardar.addEventListener('click', () => {
    const pref = leerControles();
    preferenciasGuardadas = pref;
    aplicarPreferenciasPagina(pref);
    actualizarVistaPrevia();
    try {
      localStorage.setItem(CLAVE_PREFERENCIAS, JSON.stringify(pref));
      avisar('Preferencias guardadas. Se usarán en tu próxima práctica.');
    } catch (error) {
      avisar('No se pudo guardar en este navegador. Tus cambios solo durarán mientras esta página esté abierta.');
    }
  });

  // CA05: restablecer pide confirmación y vuelve a los valores iniciales
  if (botonRestablecer) botonRestablecer.addEventListener('click', () => {
    if (!window.confirm('¿Quieres volver a la configuración inicial? Se perderán tus preferencias guardadas.')) return;
    try { localStorage.removeItem(CLAVE_PREFERENCIAS); } catch (error) { /* nada que borrar */ }
    preferenciasGuardadas = { ...PREFERENCIAS_INICIALES };
    ponerControles(preferenciasGuardadas);
    aplicarPreferenciasPagina(preferenciasGuardadas);
    actualizarVistaPrevia();
    avisar('Se restableció la configuración inicial.');
  });

  ponerControles(preferenciasGuardadas);   // al cargar, muestra lo guardado
  actualizarVistaPrevia();
}

// Las preferencias se aplican en la práctica: si "Voz" está guardada,
// el simulacro lee cada paso al pulsar Siguiente o Atrás
['boton-siguiente', 'boton-atras'].forEach((id) => {
  const boton = document.getElementById(id);
  if (!boton) return;
  boton.addEventListener('click', () => {
    if (!preferenciasGuardadas.voz) return;
    const panel = document.querySelector('.pasos-simulacro');
    leerEnVoz(`${panel.querySelector('h3').textContent}. ${panel.querySelector('.paso-texto').textContent}`);
  });
});


// =====================================================================
// Prepárate: elegir Sismo, Incendio o Inundación (con video de 30 s)
// =====================================================================
// Cada paso tiene: título, texto, nombre del video y lo que dice el video
var PASOS_POR_EMERGENCIA = {
  'Sismo': [
    { titulo: '1. Agáchate', texto: 'Baja al piso y protege tu cabeza con los brazos.', video: 'sismo-1',
      consejos: ['Baja al piso apenas sientas el temblor.', 'Protege tu cabeza y cuello con los brazos.', 'No corras mientras tiemble.'] },
    { titulo: '2. Cúbrete', texto: 'Métete bajo una mesa firme o junto a una pared interior.', video: 'sismo-2',
      consejos: ['Métete bajo una mesa firme.', 'Si no hay mesa, ponte junto a una pared interior.', 'Sujeta la pata de la mesa hasta que pare.'] },
    { titulo: '3. Espera y sal', texto: 'Espera a que pare el temblor y sal con calma.', video: 'sismo-3',
      consejos: ['Espera a que el temblor pare por completo.', 'Sal por las escaleras, nunca por el ascensor.', 'Camina con calma a la zona segura.'] }
  ],
  'Incendio': [
    { titulo: '1. Agáchate bajo el humo', texto: 'Avanza agachado: el aire más limpio está cerca del piso.', video: 'incendio-1',
      consejos: ['El humo sube: el aire limpio está abajo.', 'Avanza gateando hacia la salida.', 'Cubre tu nariz y boca con un paño.'] },
    { titulo: '2. Toca la puerta', texto: 'Si está caliente, no la abras y busca otra salida.', video: 'incendio-2',
      consejos: ['Tócala con el dorso de la mano.', 'Si está caliente, no la abras.', 'Busca otra salida o pide ayuda.'] },
    { titulo: '3. Sal y no regreses', texto: 'Usa las escaleras, nunca el ascensor.', video: 'incendio-3',
      consejos: ['Usa las escaleras, nunca el ascensor.', 'No vuelvas por tus cosas.', 'Ya afuera, llama a los bomberos al 116.'] }
  ],
  'Inundación': [
    { titulo: '1. Sube a un lugar alto', texto: 'Ve a un piso alto o a una zona elevada.', video: 'inundacion-1',
      consejos: ['Ve a un piso alto o a una zona elevada.', 'Lleva tu celular y tu ficha de apoyo.', 'Espera las indicaciones de las autoridades.'] },
    { titulo: '2. Corta la luz', texto: 'Apaga la electricidad solo si puedes hacerlo sin mojarte.', video: 'inundacion-2',
      consejos: ['Baja la llave general si está seca.', 'No toques enchufes con las manos mojadas.', 'Si hay agua cerca del tablero, no lo toques.'] },
    { titulo: '3. No cruces el agua', texto: 'No camines ni manejes por calles inundadas.', video: 'inundacion-3',
      consejos: ['Poca agua en movimiento puede arrastrarte.', 'No camines ni manejes por calles inundadas.', 'Espera a que baje el agua.'] }
  ]
};

var preparate = document.getElementById('preparate');

if (preparate) {
  var botonesEmergencia = preparate.querySelectorAll('.selector-emergencia button');
  var tarjetasPaso = preparate.querySelectorAll('.tarjeta-paso');

  // Debajo de cada video se agrega "Texto del video" (para quien no puede verlo)
  for (var tp = 0; tp < tarjetasPaso.length; tp++) {
    var textoVideo = document.createElement('details');
    textoVideo.className = 'texto-video';
    textoVideo.innerHTML = '<summary>Texto del video</summary><ul></ul>';
    tarjetasPaso[tp].appendChild(textoVideo);
  }

  // Pone en las 3 tarjetas el título, texto, video y texto del video
  function mostrarEmergencia(emergencia) {
    var pasos = PASOS_POR_EMERGENCIA[emergencia];
    for (var i = 0; i < tarjetasPaso.length; i++) {
      var paso = pasos[i];
      var tarjeta = tarjetasPaso[i];
      tarjeta.querySelector('.paso-titulo').textContent = paso.titulo;
      tarjeta.querySelector('p').textContent = paso.texto;

      var video = tarjeta.querySelector('video');
      if (video) {                    // solo si el HTML ya tiene la etiqueta <video>
        video.pause();
        video.poster = '../assets/videos/' + paso.video + '.jpg';
        video.src = '../assets/videos/' + paso.video + '.mp4';
        video.setAttribute('aria-label', 'Video de 30 segundos sin sonido: ' + paso.titulo);
      }

      var lista = tarjeta.querySelector('.texto-video ul');
      lista.innerHTML = '';
      for (var c = 0; c < paso.consejos.length; c++) {
        var item = document.createElement('li');
        item.textContent = paso.consejos[c];
        lista.appendChild(item);
      }
    }
  }

  for (var be = 0; be < botonesEmergencia.length; be++) {
    botonesEmergencia[be].addEventListener('click', function () {
      // Solo un botón queda presionado (aria-pressed lo anuncia el lector)
      for (var i = 0; i < botonesEmergencia.length; i++) {
        botonesEmergencia[i].setAttribute('aria-pressed', botonesEmergencia[i] === this ? 'true' : 'false');
      }
      mostrarEmergencia(this.textContent.trim());
    });
  }

  // Al abrir la página se muestra Sismo
  mostrarEmergencia('Sismo');
}


// =====================================================================
// W-10 · Mi ficha de apoyo: ver vista previa y guardar la ficha
// =====================================================================
var ficha = document.getElementById('ficha-apoyo');

if (ficha) {
  // Los 4 campos, con el título que se muestra en la vista previa
  var camposFicha = [
    { id: 'ficha-comunicacion', titulo: 'Cómo me comunico' },
    { id: 'ficha-condiciones', titulo: 'Condiciones o medicinas' },
    { id: 'ficha-alergias', titulo: 'Alergias' },
    { id: 'ficha-contacto', titulo: 'Persona a quien llamar' }
  ];

  var botonesFicha = ficha.querySelectorAll('.acciones button');
  var botonGuardarFicha = botonesFicha[0];   // "Guardar ficha"
  var botonVerVista = botonesFicha[1];       // "Ver vista previa"
  var interruptorCompartir = ficha.querySelector('.interruptor input');
  var cajaVista = ficha.querySelector('.vista-ayuda');
  var lineasGrises = ficha.querySelector('.lineas-vista');

  // Lugar donde se escribe la vista previa (se crea una sola vez)
  var contenidoVista = document.createElement('div');
  contenidoVista.className = 'contenido-vista';
  cajaVista.appendChild(contenidoVista);

  // Mensaje debajo de los botones (role="status": el lector lo anuncia)
  var mensajeFicha = document.createElement('p');
  mensajeFicha.className = 'mensaje-ficha';
  mensajeFicha.setAttribute('role', 'status');
  ficha.querySelector('.acciones').after(mensajeFicha);

  // Devuelve true si el usuario escribió algo en al menos un campo
  function fichaTieneDatos() {
    for (var i = 0; i < camposFicha.length; i++) {
      var valor = document.getElementById(camposFicha[i].id).value.trim();
      if (valor !== '') {
        return true;
      }
    }
    return false;
  }

  // Escribe en el recuadro lo que verá la persona que ayuda
  function mostrarVistaPrevia() {
    contenidoVista.innerHTML = '';          // borra la vista anterior
    lineasGrises.style.display = 'none';    // oculta las líneas grises

    for (var i = 0; i < camposFicha.length; i++) {
      var valor = document.getElementById(camposFicha[i].id).value.trim();
      if (valor === '') {
        valor = 'No indicado';
      }

      var parrafo = document.createElement('p');
      var titulo = document.createElement('strong');
      titulo.textContent = camposFicha[i].titulo + ': ';
      parrafo.appendChild(titulo);
      // textContent muestra el texto tal cual (más seguro que innerHTML)
      parrafo.appendChild(document.createTextNode(valor));
      contenidoVista.appendChild(parrafo);
    }

    if (!interruptorCompartir.checked) {
      var aviso = document.createElement('p');
      aviso.className = 'aviso-no-compartir';
      aviso.textContent = 'Esta ficha no se compartirá al pedir ayuda.';
      contenidoVista.appendChild(aviso);
    }
  }

  // Botón "Ver vista previa"
  botonVerVista.addEventListener('click', function () {
    if (!fichaTieneDatos()) {
      mensajeFicha.textContent = 'Completa al menos un campo para ver la vista previa.';
      return;
    }
    mostrarVistaPrevia();
    mensajeFicha.textContent = 'Así verá tu ficha la persona que te ayude.';
  });

  // Botón "Guardar ficha": guarda los datos en este navegador
  botonGuardarFicha.addEventListener('click', function () {
    if (!fichaTieneDatos()) {
      mensajeFicha.textContent = 'Completa al menos un campo antes de guardar.';
      return;
    }

    var datos = { compartir: interruptorCompartir.checked };
    for (var i = 0; i < camposFicha.length; i++) {
      datos[camposFicha[i].id] = document.getElementById(camposFicha[i].id).value.trim();
    }

    try {
      localStorage.setItem('alerta360-ficha', JSON.stringify(datos));
      mostrarVistaPrevia();
      mensajeFicha.textContent = 'Ficha guardada. La verás igual al volver a abrir la página.';
    } catch (error) {
      mensajeFicha.textContent = 'No se pudo guardar en este navegador. Tus datos solo durarán mientras esta página esté abierta.';
    }
  });

  // Si cambia el interruptor y ya hay vista previa, se actualiza
  interruptorCompartir.addEventListener('change', function () {
    if (contenidoVista.innerHTML !== '') {
      mostrarVistaPrevia();
    }
  });

  // Al abrir la página: si hay una ficha guardada, se vuelve a llenar
  try {
    var guardado = localStorage.getItem('alerta360-ficha');
    if (guardado) {
      var datosGuardados = JSON.parse(guardado);
      for (var j = 0; j < camposFicha.length; j++) {
        if (datosGuardados[camposFicha[j].id]) {
          document.getElementById(camposFicha[j].id).value = datosGuardados[camposFicha[j].id];
        }
      }
      interruptorCompartir.checked = datosGuardados.compartir;
      mostrarVistaPrevia();
    }
  } catch (error) {
    // Si el navegador no deja leer, la ficha empieza vacía
  }
}


// =====================================================================
// Zonas seguras · Mapa de Google Maps
// - Al tocar una zona de la lista, el mapa muestra su marcador.
// - En celular: pide la ubicación al abrir la página.
// - En computadora: no muestra tu ubicación hasta que pulses
//   "Usar mi ubicación".
// El navegador SIEMPRE pide permiso antes de dar la ubicación.
// =====================================================================
var mapaZonas = document.getElementById('mapa-zonas');

if (mapaZonas) {
  // Las zonas seguras, en el mismo orden que los botones de la lista
  var zonasSeguras = [
    { nombre: 'Parque de la Exposición', latitud: -12.0617, longitud: -77.0366 },
    { nombre: 'Plaza San Martín', latitud: -12.0517, longitud: -77.0346 },
    { nombre: 'Campo de Marte', latitud: -12.0707, longitud: -77.0437 }
  ];

  var botonesZona = document.querySelectorAll('.opciones-zonas .zona');
  var botonMiUbicacion = document.getElementById('boton-mi-ubicacion');
  var estadoUbicacion = document.getElementById('estado-ubicacion');
  var descripcionMapa = document.querySelector('.descripcion-mapa-texto p');
  var botonesZoom = document.querySelectorAll('.zoom-mapa input');

  // Lo que muestra el mapa ahora
  var centroMapa = '-12.0612,-77.0380';   // Lima Centro
  var zoomMapa = 14;
  var conMarcador = false;                // false = solo el mapa, sin marcador
  var miUbicacion = null;                 // se llena cuando el usuario da permiso

  // ¿Es un celular o tablet? (se revisa el nombre del dispositivo)
  var esCelular = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Vuelve a dibujar el mapa.
  // q= pone un marcador en el punto; ll= solo centra el mapa (sin marcador)
  // Para que el cambio sea fluido, el mapa nuevo se carga en un segundo
  // iframe invisible. Mientras carga, el mapa actual se agranda o se achica
  // (efecto de acercar o alejar) y, cuando el nuevo está listo, aparece
  // con un fundido. Así no se ve la pantalla en blanco al recargar.
  // efecto: 'acercar', 'alejar' o nada.
  function dibujarMapa(efecto) {
    var parametro = 'll=';
    if (conMarcador) {
      parametro = 'q=';
    }
    var direccion = 'https://maps.google.com/maps?' + parametro + centroMapa +
                    '&z=' + zoomMapa + '&output=embed';

    // Si había un mapa a medio cargar (clics muy seguidos), se descarta
    var pendiente = mapaZonas.parentElement.querySelector('iframe.mapa-cargando');
    if (pendiente) {
      pendiente.remove();
    }

    var mapaViejo = mapaZonas;
    var mapaNuevo = mapaViejo.cloneNode(false);
    mapaNuevo.removeAttribute('id');
    mapaNuevo.classList.add('mapa-cargando');
    mapaNuevo.src = direccion;
    mapaViejo.after(mapaNuevo);

    if (efecto === 'acercar') {
      mapaViejo.classList.add('mapa-acercando');
    } else if (efecto === 'alejar') {
      mapaViejo.classList.add('mapa-alejando');
    }

    var cambiado = false;
    function mostrarNuevo() {
      if (cambiado || !mapaNuevo.isConnected) {
        return;
      }
      cambiado = true;
      mapaNuevo.title = mapaViejo.title;              // conserva la descripción actualizada
      mapaNuevo.classList.remove('mapa-cargando');   // aparece con fundido
      mapaNuevo.id = 'mapa-zonas';
      mapaViejo.removeAttribute('id');
      mapaZonas = mapaNuevo;
      setTimeout(function () { mapaViejo.remove(); }, 450);
    }
    mapaNuevo.addEventListener('load', mostrarNuevo);
    setTimeout(mostrarNuevo, 4000);   // por si el mapa tarda demasiado
  }

  // Distancia en metros entre dos puntos (fórmula de Haversine)
  function distanciaEnMetros(lat1, lon1, lat2, lon2) {
    var radioTierra = 6371000;
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return Math.round(radioTierra * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  // Escribe la distancia a cada zona (por ejemplo, "850 m" o "2.3 km")
  function textoDistancia(metros) {
    if (metros < 1000) {
      return metros + ' m';
    }
    return (metros / 1000).toFixed(1) + ' km';
  }

  // Marca la zona elegida en la lista y muestra su marcador en el mapa
  function mostrarZona(indice) {
    var zona = zonasSeguras[indice];

    for (var i = 0; i < botonesZona.length; i++) {
      botonesZona[i].setAttribute('aria-pressed', i === indice ? 'true' : 'false');
    }

    centroMapa = zona.latitud + ',' + zona.longitud;
    zoomMapa = 17;
    conMarcador = true;
    dibujarMapa();

    mapaZonas.title = 'Mapa con la zona segura: ' + zona.nombre;
    var texto = 'El mapa muestra la zona segura ' + zona.nombre + ', punto de encuentro.';
    if (miUbicacion) {
      var metros = distanciaEnMetros(miUbicacion.latitud, miUbicacion.longitud, zona.latitud, zona.longitud);
      texto = texto + ' Está a ' + textoDistancia(metros) + ' de ti.';
    }
    descripcionMapa.textContent = texto + ' Sigue la ruta paso a paso para llegar.';
    estadoUbicacion.textContent = 'Mostrando ' + zona.nombre + ' en el mapa.';
  }

  // Conecta cada botón de zona con su marcador
  // (cada botón guarda su número de zona en data-zona: 0, 1 o 2)
  for (var z = 0; z < botonesZona.length && z < zonasSeguras.length; z++) {
    botonesZona[z].setAttribute('data-zona', z);
    botonesZona[z].addEventListener('click', function () {
      mostrarZona(Number(this.getAttribute('data-zona')));
    });
  }

  // Cuando el navegador entrega la ubicación
  function ubicacionEncontrada(posicion) {
    miUbicacion = {
      latitud: posicion.coords.latitude,
      longitud: posicion.coords.longitude
    };
    var precision = Math.round(posicion.coords.accuracy);

    centroMapa = miUbicacion.latitud.toFixed(5) + ',' + miUbicacion.longitud.toFixed(5);
    zoomMapa = 17;
    conMarcador = true;
    dibujarMapa();

    // Distancia a cada zona y cuál es la más cercana
    var masCercana = 0;
    var menorDistancia = Infinity;
    for (var i = 0; i < zonasSeguras.length && i < botonesZona.length; i++) {
      var metros = distanciaEnMetros(miUbicacion.latitud, miUbicacion.longitud,
                                     zonasSeguras[i].latitud, zonasSeguras[i].longitud);
      botonesZona[i].querySelector('.zona-texto span').textContent =
        textoDistancia(metros) + ' · Punto de encuentro';
      if (metros < menorDistancia) {
        menorDistancia = metros;
        masCercana = i;
      }
    }
    for (var j = 0; j < botonesZona.length; j++) {
      botonesZona[j].setAttribute('aria-pressed', 'false');
    }

    mapaZonas.title = 'Mapa con tu ubicación actual';
    estadoUbicacion.textContent = 'Mostrando tu ubicación (precisión de unos ' + precision + ' m). ' +
      'La zona más cercana es ' + zonasSeguras[masCercana].nombre + ', a ' +
      textoDistancia(menorDistancia) + '. Tócala en la lista para verla en el mapa.';
    descripcionMapa.textContent = 'El mapa está centrado en tu ubicación actual. ' +
      'Toca una zona de la lista para ver dónde está.';
    botonMiUbicacion.value = '📍 Actualizar mi ubicación';
  }

  // Cuando no se pudo obtener la ubicación
  function ubicacionNoDisponible(error) {
    if (error.code === 1) {
      estadoUbicacion.textContent = 'No diste permiso para usar tu ubicación. ' +
                                    'Toca una zona de la lista para verla en el mapa.';
    } else {
      estadoUbicacion.textContent = 'No se pudo encontrar tu ubicación. ' +
                                    'Toca una zona de la lista para verla en el mapa.';
    }
  }

  // Pide la ubicación al navegador (aparece la ventana de permiso)
  function pedirUbicacion() {
    if (!('geolocation' in navigator)) {
      estadoUbicacion.textContent = 'Este navegador no puede mostrar tu ubicación.';
      return;
    }
    estadoUbicacion.textContent = 'Buscando tu ubicación…';
    navigator.geolocation.getCurrentPosition(ubicacionEncontrada, ubicacionNoDisponible, {
      enableHighAccuracy: true,   // usa el GPS si está disponible
      timeout: 15000              // espera como máximo 15 segundos
    });
  }

  botonMiUbicacion.addEventListener('click', pedirUbicacion);

  // Botones + y − del mapa
  if (botonesZoom.length === 2) {
    botonesZoom[0].addEventListener('click', function () {
      if (zoomMapa < 20) {
        zoomMapa = zoomMapa + 1;
        dibujarMapa('acercar');
      }
    });
    botonesZoom[1].addEventListener('click', function () {
      if (zoomMapa > 3) {
        zoomMapa = zoomMapa - 1;
        dibujarMapa('alejar');
      }
    });
  }

  // ----- Buscar un distrito o dirección -----
  var campoBusqueda = document.querySelector('.barra-direccion');
  var botonBuscar = document.querySelector('.boton-busqueda input');

  function buscarDireccion() {
    var texto = campoBusqueda.value.trim();
    if (texto === '') {
      estadoUbicacion.textContent = 'Escribe un distrito o una dirección para buscar.';
      campoBusqueda.focus();
      return;
    }
    centroMapa = encodeURIComponent(texto + ', Lima, Perú');
    zoomMapa = 15;
    conMarcador = true;
    dibujarMapa();
    for (var i = 0; i < botonesZona.length; i++) {
      botonesZona[i].setAttribute('aria-pressed', 'false');
    }
    mapaZonas.title = 'Mapa con el resultado de búsqueda: ' + texto;
    estadoUbicacion.textContent = 'Mostrando «' + texto + '» en el mapa.';
    descripcionMapa.textContent = 'El mapa muestra el lugar que buscaste: ' + texto +
                                  '. Toca una zona de la lista para ver la zona segura.';
  }

  botonBuscar.addEventListener('click', buscarDireccion);
  campoBusqueda.addEventListener('keydown', function (evento) {
    if (evento.key === 'Enter') {
      buscarDireccion();
    }
  });

  // ----- Ruta paso a paso -----
  var botonesRuta = document.querySelectorAll('.opciones-pasos input[type="button"]');
  var avisoBloqueo = document.querySelector('.ruta-alternativa p');
  var referencias = document.querySelector('.referencias p');
  var llegada = document.querySelector('.confirmacion-llegada');
  var botonEscucharRuta = document.querySelector('.escuchar-ruta button');
  var botonRutaAlternativa = document.querySelector('.acciones-ruta .opciones-zonas input');

  var rutaPrincipal = [
    '1. Avanza 50 m al norte (vibración: avanzar)',
    '2. Gira a la izquierda en la esquina',
    '3. Camina 100 m hasta el parque'
  ];
  var rutaAlterna = [
    '1. Regresa 20 m y sal por la puerta lateral',
    '2. Avanza 80 m al este por la vereda ancha',
    '3. Gira a la derecha y camina 120 m hasta el parque'
  ];
  var usandoAlternativa = false;

  // Escribe los pasos de la ruta elegida y los deja sin marcar
  function ponerRuta(pasos) {
    for (var i = 0; i < botonesRuta.length; i++) {
      botonesRuta[i].value = pasos[i];
      botonesRuta[i].setAttribute('aria-pressed', 'false');
    }
    llegada.hidden = true;
  }

  // Al tocar un paso, se marca como hecho (✓). Al completar los 3, llegaste.
  for (var r = 0; r < botonesRuta.length; r++) {
    botonesRuta[r].setAttribute('aria-pressed', 'false');
    botonesRuta[r].addEventListener('click', function () {
      var hecho = this.getAttribute('aria-pressed') === 'true';
      this.setAttribute('aria-pressed', hecho ? 'false' : 'true');

      // Paso con vibración: el celular vibra para indicar "avanzar"
      if (!hecho && this.value.indexOf('vibración') !== -1 && 'vibrate' in navigator) {
        navigator.vibrate([300, 150, 300]);
      }

      var completos = 0;
      for (var i = 0; i < botonesRuta.length; i++) {
        if (botonesRuta[i].getAttribute('aria-pressed') === 'true') {
          completos = completos + 1;
        }
      }
      llegada.hidden = completos < botonesRuta.length;
      if (completos === botonesRuta.length) {
        estadoUbicacion.textContent = 'Llegaste al lugar seguro. Quédate ahí y espera indicaciones.';
      } else {
        estadoUbicacion.textContent = 'Pasos completados: ' + completos + ' de ' + botonesRuta.length + '.';
      }
    });
  }
  llegada.hidden = true;   // "Llegaste al lugar seguro" aparece al completar la ruta
  llegada.setAttribute('role', 'status');

  // "Escuchar ruta": lee los pasos y las referencias en voz alta
  botonEscucharRuta.addEventListener('click', function () {
    var texto = 'Ruta a la zona segura. ';
    for (var i = 0; i < botonesRuta.length; i++) {
      texto = texto + botonesRuta[i].value + '. ';
    }
    texto = texto + referencias.textContent;
    if (!leerEnVoz(texto)) {
      estadoUbicacion.textContent = 'Tu navegador no puede leer la ruta en voz alta.';
    }
  });

  // "Ruta alternativa": cambia a otra ruta si el camino está bloqueado
  botonRutaAlternativa.addEventListener('click', function () {
    usandoAlternativa = !usandoAlternativa;
    if (usandoAlternativa) {
      ponerRuta(rutaAlterna);
      botonRutaAlternativa.value = 'Ruta principal';
      avisoBloqueo.textContent = '✓ Mostrando ruta alternativa (evita el camino bloqueado)';
      estadoUbicacion.textContent = 'Se cambió a la ruta alternativa.';
    } else {
      ponerRuta(rutaPrincipal);
      botonRutaAlternativa.value = 'Ruta alternativa';
      avisoBloqueo.textContent = '⚠ Camino bloqueado → ver ruta alternativa';
      estadoUbicacion.textContent = 'Se volvió a la ruta principal.';
    }
  });

  // Al abrir la página
  descripcionMapa.textContent = 'El mapa muestra Lima Centro, donde están las 3 zonas seguras. ' +
                                'Toca una zona de la lista para ver su marcador.';
  if (esCelular) {
    pedirUbicacion();
  }
}


// =====================================================================
// Ayudas comunes para los bloques siguientes
// =====================================================================

// Crea un mensaje de estado debajo de un elemento (el lector lo anuncia)
function crearMensaje(despuesDe, clase) {
  var mensaje = document.createElement('p');
  mensaje.className = 'mensaje-estado ' + (clase || '');
  mensaje.setAttribute('role', 'status');
  despuesDe.after(mensaje);
  return mensaje;
}

// Hora actual como texto "14:32"
function horaActual() {
  var ahora = new Date();
  var minutos = ahora.getMinutes();
  if (minutos < 10) {
    minutos = '0' + minutos;
  }
  return ahora.getHours() + ':' + minutos;
}

// Guarda y lee datos del navegador sin que la página falle si está bloqueado
function guardarDato(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch (error) {
    return false;
  }
}
function leerDato(clave) {
  try {
    var texto = localStorage.getItem(clave);
    if (texto) {
      return JSON.parse(texto);
    }
  } catch (error) { /* sin datos */ }
  return null;
}


// =====================================================================
// W-01 · Instrucciones sin conexión: Sismo, Incendio, Inundación
// =====================================================================
var instrucciones = document.getElementById('instrucciones-sin-conexion');

if (instrucciones) {
  // Para cada emergencia: texto del paso, imagen y su texto alternativo
  var pasosInstrucciones = {
    'Sismo': [
      { texto: '1. Agáchate y cúbrete', imagen: 'agachate-fondo.png', alt: 'Pictograma: persona agachada bajo una mesa' },
      { texto: '2. Aléjate de las ventanas', imagen: 'alejate-fondo.png', alt: 'Pictograma: persona alejándose de una ventana' },
      { texto: '3. Sal cuando pase el temblor', imagen: 'sal-fondo.png', alt: 'Pictograma: persona saliendo del edificio' }
    ],
    'Incendio': [
      { texto: '1. Agáchate bajo el humo', imagen: 'agachate-humo-fondo.png', alt: 'Pictograma: persona gateando por debajo del humo' },
      { texto: '2. Toca la puerta antes de abrir', imagen: 'toca-puerta-fondo.png', alt: 'Pictograma: persona tocando una puerta caliente con la mano' },
      { texto: '3. Sal y no regreses', imagen: 'sal-no-regreses-fondo.png', alt: 'Pictograma: persona alejándose del fuego' }
    ],
    'Inundación': [
      { texto: '1. Sube a un lugar alto', imagen: 'sube-alto-fondo.png', alt: 'Pictograma: persona arriba de una escalera, lejos del agua' },
      { texto: '2. Corta la luz si puedes', imagen: 'corta-luz-fondo.png', alt: 'Pictograma: tablero eléctrico con la palanca bajada' },
      { texto: '3. No cruces el agua', imagen: 'no-cruza-agua-fondo.png', alt: 'Pictograma: prohibido cruzar el agua' }
    ]
  };
  var botonesInstr = instrucciones.querySelectorAll('.selector-emergencia button');
  var tarjetasInstr = instrucciones.querySelectorAll('.tarjeta-paso');
  instrucciones.querySelector('.tarjetas-pasos').setAttribute('aria-live', 'polite');

  for (var bi = 0; bi < botonesInstr.length; bi++) {
    botonesInstr[bi].addEventListener('click', function () {
      var emergencia = this.textContent.trim();
      for (var i = 0; i < botonesInstr.length; i++) {
        botonesInstr[i].setAttribute('aria-pressed', botonesInstr[i] === this ? 'true' : 'false');
      }
      for (var j = 0; j < tarjetasInstr.length; j++) {
        var paso = pasosInstrucciones[emergencia][j];
        var imagen = tarjetasInstr[j].querySelector('img');
        tarjetasInstr[j].querySelector('.paso-texto').textContent = paso.texto;
        imagen.src = '../assets/images/' + paso.imagen;
        imagen.alt = paso.alt;
      }
    });
  }
}


// =====================================================================
// W-02 · Mi perfil: "Ya vi el aviso" en la vista previa
// =====================================================================
var botonYaVi = document.querySelector('#vista-previa-simulacro input[value="Ya vi el aviso"]');

if (botonYaVi) {
  botonYaVi.addEventListener('click', function () {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();      // detiene la voz si estaba leyendo
    }
    var mensajePerfil = document.querySelector('.mensaje-perfil');
    if (mensajePerfil) {
      mensajePerfil.textContent = 'Aviso confirmado a las ' + horaActual() + '. Se detuvo la lectura en voz alta.';
    }
  });
}


// =====================================================================
// W-08 · Avisos accesibles: frases en pantalla grande y preferencias
// =====================================================================
var avisos = document.getElementById('avisos-accesibles');

if (avisos) {
  // ----- Frases en pantalla grande -----
  // Se usa <dialog>: tapa la página, se cierra con "Cerrar" o con Escape
  var pantallaFrase = document.createElement('dialog');
  pantallaFrase.className = 'pantalla-frase';
  pantallaFrase.innerHTML =
    '<p class="frase-grande"></p>' +
    '<textarea class="frase-escribir" aria-label="Escribe aquí tu mensaje" rows="3"></textarea>' +
    '<button type="button" class="boton-principal">Cerrar</button>';
  document.body.appendChild(pantallaFrase);

  var fraseGrande = pantallaFrase.querySelector('.frase-grande');
  var campoEscribir = pantallaFrase.querySelector('.frase-escribir');
  pantallaFrase.querySelector('button').addEventListener('click', function () {
    pantallaFrase.close();
  });

  var botonesFrase = avisos.querySelectorAll('.frases button');
  for (var bf = 0; bf < botonesFrase.length; bf++) {
    botonesFrase[bf].addEventListener('click', function () {
      fraseGrande.textContent = this.textContent.trim();
      // "Escríbeme aquí" muestra además un cuadro para que la otra persona escriba
      campoEscribir.hidden = this.textContent.indexOf('Escríbeme') === -1;
      campoEscribir.value = '';
      pantallaFrase.showModal();
    });
  }

  // ----- Preferencias del aviso -----
  var interruptoresAviso = avisos.querySelectorAll('.preferencias input[type="checkbox"]');
  var cajaVideo = avisos.querySelector('.medio-aviso .caja-video');
  var subtitulos = avisos.querySelector('.subtitulos');
  var selectIdioma = document.getElementById('pref-idioma');
  var selectVoz = document.getElementById('pref-voz');
  var selectVelocidad = document.getElementById('pref-velocidad');
  var botonesAvisos = avisos.querySelectorAll('.acciones button');
  var botonMuestra = botonesAvisos[0];
  var botonGuardarAvisos = botonesAvisos[1];
  var mensajeAvisos = crearMensaje(avisos.querySelector('.acciones'));

  // Muestra u oculta el video y los subtítulos según los interruptores
  function aplicarMedios() {
    cajaVideo.hidden = !interruptoresAviso[0].checked;
    subtitulos.hidden = !interruptoresAviso[1].checked;
  }
  interruptoresAviso[0].addEventListener('change', aplicarMedios);
  interruptoresAviso[1].addEventListener('change', aplicarMedios);

  // "▶ Escuchar muestra": lee un aviso de ejemplo con la voz y velocidad elegidas
  botonMuestra.addEventListener('click', function () {
    if (!('speechSynthesis' in window)) {
      mensajeAvisos.textContent = 'Tu navegador no puede leer avisos en voz alta.';
      return;
    }
    var idioma = selectIdioma.value;
    var texto = 'Sismo en Lima Centro. Sal con calma.';
    var codigo = 'es-PE';
    if (idioma === 'Inglés') {
      texto = 'Earthquake in Lima Centro. Leave calmly.';
      codigo = 'en-US';
    }

    var lectura = new SpeechSynthesisUtterance(texto);
    lectura.lang = codigo;
    lectura.rate = 1;
    if (selectVelocidad.value.indexOf('lenta') !== -1) {
      lectura.rate = 0.7;
    } else if (selectVelocidad.value.indexOf('rápida') !== -1) {
      lectura.rate = 1.3;
    }
    lectura.pitch = selectVoz.value.indexOf('Masculina') !== -1 ? 0.8 : 1.2;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(lectura);

    if (idioma === 'Quechua') {
      mensajeAvisos.textContent = 'El navegador no tiene voz en quechua: la muestra se lee en español.';
    } else {
      mensajeAvisos.textContent = 'Reproduciendo muestra: ' + selectVoz.value.replace('Voz: ', 'voz ').toLowerCase() +
                                  ', ' + selectVelocidad.value.replace('Velocidad: ', 'velocidad ') + '.';
    }
  });

  // "Guardar": guarda las preferencias de los avisos
  botonGuardarAvisos.addEventListener('click', function () {
    var datos = {
      video: interruptoresAviso[0].checked,
      subtitulos: interruptoresAviso[1].checked,
      idioma: selectIdioma.value,
      voz: selectVoz.value,
      velocidad: selectVelocidad.value
    };
    if (guardarDato('alerta360-avisos', datos)) {
      mensajeAvisos.textContent = 'Preferencias de avisos guardadas.';
    } else {
      mensajeAvisos.textContent = 'No se pudo guardar en este navegador. Los cambios durarán mientras la página esté abierta.';
    }
  });

  // Al abrir la página: recupera lo guardado
  var avisosGuardados = leerDato('alerta360-avisos');
  if (avisosGuardados) {
    interruptoresAviso[0].checked = avisosGuardados.video;
    interruptoresAviso[1].checked = avisosGuardados.subtitulos;
    selectIdioma.value = avisosGuardados.idioma;
    selectVoz.value = avisosGuardados.voz;
    selectVelocidad.value = avisosGuardados.velocidad;
  }
  aplicarMedios();
}


// =====================================================================
// W-03 · Simulacro: lista completa, iniciar y ajustar preferencias
// =====================================================================
var botonLista = document.querySelector('.lista-instrucciones input');
var botonIniciar = document.querySelector('.botones-simulacro .boton-principal');
var botonAjustar = document.querySelector('.botones-simulacro input:not(.boton-principal)');

if (botonLista && botonIniciar && botonAjustar) {
  // ----- "Abrir lista completa": muestra todos los pasos a la vez -----
  var listaCompleta = document.createElement('ol');
  listaCompleta.className = 'lista-completa';
  listaCompleta.id = 'lista-completa-simulacro';
  listaCompleta.hidden = true;
  for (var lc = 0; lc < pasosSimulacro.length; lc++) {
    var itemLista = document.createElement('li');
    itemLista.textContent = pasosSimulacro[lc].texto;
    listaCompleta.appendChild(itemLista);
  }
  botonLista.after(listaCompleta);
  botonLista.setAttribute('aria-expanded', 'false');
  botonLista.setAttribute('aria-controls', 'lista-completa-simulacro');

  botonLista.addEventListener('click', function () {
    listaCompleta.hidden = !listaCompleta.hidden;
    botonLista.setAttribute('aria-expanded', listaCompleta.hidden ? 'false' : 'true');
    botonLista.value = listaCompleta.hidden ? 'Abrir lista completa' : 'Cerrar lista';
  });

  // ----- "Iniciar simulacro": vuelve al paso 1 y mide el tiempo -----
  var resultado = document.querySelector('.simulacro-resultado p');
  var panelSimulacro = document.querySelector('.pasos-simulacro');
  var inicioSimulacro = null;
  var temporizador = null;

  // Si pasan 30 s sin pulsar nada, se repite la instrucción (como dice el recordatorio)
  function reiniciarRecordatorio() {
    clearTimeout(temporizador);
    if (inicioSimulacro === null) {
      return;
    }
    temporizador = setTimeout(function () {
      var texto = panelSimulacro.querySelector('.paso-texto').textContent;
      var instruccion = panelSimulacro.querySelector('.paso-texto strong');
      instruccion.textContent = texto;          // vuelve a anunciarla (aria-live)
      leerEnVoz('Recuerda: ' + texto);
      reiniciarRecordatorio();
    }, 30000);
  }

  botonIniciar.addEventListener('click', function () {
    window.reiniciarSimulacro();
    inicioSimulacro = Date.now();
    resultado.textContent = 'Simulacro en curso…';
    panelSimulacro.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById('boton-siguiente').focus();
    reiniciarRecordatorio();
  });

  // Cada vez que pulsa Siguiente o Atrás se reinicia el recordatorio.
  // Al terminar, se muestra el resultado con el tiempo y los canales.
  document.getElementById('boton-siguiente').addEventListener('click', function () {
    reiniciarRecordatorio();
    if (inicioSimulacro !== null && panelSimulacro.querySelector('h3').textContent === 'Simulacro completado') {
      clearTimeout(temporizador);
      var segundos = Math.round((Date.now() - inicioSimulacro) / 1000);
      var pref = leerPreferencias();
      var canales = [];
      if (pref.vibracion) { canales.push('vibración'); }
      if (pref.luz) { canales.push('luces'); }
      if (pref.voz) { canales.push('voz'); }
      if (pref.texto) { canales.push('texto'); }
      resultado.textContent = 'Tu tiempo: ' + segundos + (segundos === 1 ? ' segundo' : ' segundos') +
                             ' · Canales: ' + canales.join(', ');
      inicioSimulacro = null;
    }
  });
  document.getElementById('boton-atras').addEventListener('click', reiniciarRecordatorio);

  // ----- "Ajustar preferencias": lleva a Mi perfil -----
  botonAjustar.addEventListener('click', function () {
    var perfilSeccion = document.getElementById('mi-perfil');
    perfilSeccion.scrollIntoView({ behavior: 'smooth' });
    var primeraOpcion = perfilSeccion.querySelector('.tarjeta[tabindex="0"]');
    if (primeraOpcion) {
      primeraOpcion.focus({ preventScroll: true });
    }
  });
}


// =====================================================================
// W-05 · Contactos de confianza (máximo 5)
// =====================================================================
var seccionContactos = document.getElementById('contactos');

if (seccionContactos) {
  var listaContactos = seccionContactos.querySelector('.lista-contactos');
  var mensajeContactos = document.getElementById('msg-contactos');
  var campoNombre = document.getElementById('nombre-contacto');
  var campoCelular = document.getElementById('celular-contacto');
  var campoRelacion = document.getElementById('relacion-contacto');
  var botonInvitar = seccionContactos.querySelector('.enviar-contacto input');
  var botonGuardarContactos = seccionContactos.querySelector('.guardar-contactos input');
  var casillaUbicacion = document.getElementById('compartir-ubicacion');

  // Lee los contactos que se ven en la lista
  function leerContactos() {
    var filas = listaContactos.querySelectorAll('.fila.contacto');
    var contactos = [];
    for (var i = 0; i < filas.length; i++) {
      var datos = filas[i].querySelectorAll('p');
      contactos.push({
        nombre: datos[0].textContent.trim(),
        relacion: datos[1].textContent.trim(),
        estado: datos[2].textContent.trim()
      });
    }
    return contactos;
  }

  // Crea una fila de contacto igual a las del HTML
  function crearFilaContacto(contacto) {
    var fila = document.createElement('div');
    fila.className = 'fila contacto';

    var nombre = document.createElement('p');
    var negrita = document.createElement('strong');
    negrita.textContent = contacto.nombre;
    nombre.appendChild(negrita);

    var relacion = document.createElement('p');
    relacion.textContent = contacto.relacion;

    var estado = document.createElement('p');
    var insignia = document.createElement('span');
    insignia.className = contacto.estado === 'Aceptó' ? 'insignia' : 'insignia pendiente';
    insignia.textContent = contacto.estado;
    estado.appendChild(insignia);

    var accion = document.createElement('input');
    accion.type = 'button';
    accion.className = 'accion';
    if (contacto.estado === 'Aceptó') {
      accion.value = 'Quitar';
      accion.setAttribute('aria-label', 'Quitar a ' + contacto.nombre);
    } else {
      accion.value = 'Reenviar';
      accion.setAttribute('aria-label', 'Reenviar invitación a ' + contacto.nombre);
    }

    fila.appendChild(nombre);
    fila.appendChild(relacion);
    fila.appendChild(estado);
    fila.appendChild(accion);
    return fila;
  }

  // Un solo listener para todos los botones Quitar / Reenviar (también los nuevos)
  listaContactos.addEventListener('click', function (evento) {
    var boton = evento.target;
    if (!boton.classList.contains('accion')) {
      return;
    }
    var fila = boton.closest('.fila');
    var nombre = fila.querySelector('strong').textContent;

    if (boton.value === 'Quitar') {
      if (window.confirm('¿Quitar a ' + nombre + ' de tus contactos de confianza?')) {
        fila.remove();
        mensajeContactos.textContent = nombre + ' ya no está en tus contactos. Pulsa «Guardar cambios» para confirmarlo.';
        campoNombre.focus();
      }
    } else {
      mensajeContactos.textContent = 'Invitación reenviada a ' + nombre + ' a las ' + horaActual() + '.';
    }
  });

  // "Enviar invitación": revisa los datos y agrega el contacto como Pendiente
  botonInvitar.addEventListener('click', function () {
    var nombre = campoNombre.value.trim();
    var celular = campoCelular.value.trim();
    var relacion = campoRelacion.value.trim();

    if (nombre === '') {
      mensajeContactos.textContent = 'Escribe el nombre del contacto.';
      campoNombre.focus();
      return;
    }
    // Celular de 9 dígitos que empieza en 9, o un correo con @
    var esCelularValido = /^9\d{8}$/.test(celular.replace(/\s/g, ''));
    var esCorreoValido = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(celular);
    if (!esCelularValido && !esCorreoValido) {
      mensajeContactos.textContent = 'Escribe un celular de 9 dígitos (ej. 987 654 321) o un correo válido.';
      campoCelular.focus();
      return;
    }
    if (leerContactos().length >= 5) {
      mensajeContactos.textContent = 'Ya tienes 5 contactos, el máximo. Quita uno para agregar otro.';
      return;
    }

    listaContactos.appendChild(crearFilaContacto({
      nombre: nombre,
      relacion: relacion === '' ? 'Sin indicar' : relacion,
      estado: 'Pendiente'
    }));
    mensajeContactos.textContent = 'Invitación enviada a ' + nombre + '. Aparecerá como «Aceptó» cuando responda.';
    campoNombre.value = '';
    campoCelular.value = '';
    campoRelacion.value = '';
  });

  // "Guardar cambios": guarda la lista y la casilla de privacidad
  botonGuardarContactos.addEventListener('click', function () {
    var datos = { contactos: leerContactos(), compartirUbicacion: casillaUbicacion.checked };
    if (guardarDato('alerta360-contactos', datos)) {
      mensajeContactos.textContent = 'Cambios guardados: ' + datos.contactos.length + ' contacto(s).';
    } else {
      mensajeContactos.textContent = 'No se pudo guardar en este navegador.';
    }
  });

  // Al abrir la página: si hay contactos guardados, se muestran esos
  var contactosGuardados = leerDato('alerta360-contactos');
  if (contactosGuardados) {
    var filasViejas = listaContactos.querySelectorAll('.fila.contacto');
    for (var fv = 0; fv < filasViejas.length; fv++) {
      filasViejas[fv].remove();
    }
    for (var cg = 0; cg < contactosGuardados.contactos.length; cg++) {
      listaContactos.appendChild(crearFilaContacto(contactosGuardados.contactos[cg]));
    }
    casillaUbicacion.checked = contactosGuardados.compartirUbicacion;
  }
}


// =====================================================================
// W-11 · Pedir ayuda sin hablar (SIMULACIÓN: no se contacta a nadie real)
// =====================================================================
var pedirAyuda = document.getElementById('pedir-ayuda');

if (pedirAyuda) {
  var botonesAyuda = pedirAyuda.querySelectorAll('.tipo-ayuda button');
  var textoTipo = pedirAyuda.querySelector('.tipoayuda');
  var textoUbicacionAyuda = pedirAyuda.querySelector('.ubicacion');
  var textoFicha = pedirAyuda.querySelector('.ficha');
  var estadoAyuda = pedirAyuda.querySelector('.estado-mensaje');
  var botonCancelar = pedirAyuda.querySelector('.cancelar-boton');
  var solicitudActiva = false;
  var solicitudPendiente = null;   // si no hay internet, se guarda aquí

  estadoAyuda.setAttribute('role', 'status');
  estadoAyuda.textContent = 'Estado: elige el tipo de ayuda que necesitas.';

  // Revisa si la ficha de apoyo está guardada y se puede compartir
  function textoDeFicha() {
    var ficha = leerDato('alerta360-ficha');
    if (ficha && ficha.compartir) {
      return 'Mi ficha de apoyo: incluida';
    }
    return 'Mi ficha de apoyo: no incluida';
  }

  function enviarSolicitud(tipo) {
    solicitudActiva = true;
    if (navigator.onLine) {
      solicitudPendiente = null;
      estadoAyuda.innerHTML = 'Estado: Solicitud de ' + tipo + ' enviada a las ' + horaActual() +
                              '<br>Ayuda en camino (simulación)';
    } else {
      solicitudPendiente = tipo;
      estadoAyuda.innerHTML = 'Estado: Sin conexión<br>La solicitud se guardó y se enviará al volver la señal';
    }
  }

  for (var ba = 0; ba < botonesAyuda.length; ba++) {
    botonesAyuda[ba].addEventListener('click', function () {
      var tipo = this.textContent.trim().toLowerCase();       // "bomberos", "ambulancia"...
      for (var i = 0; i < botonesAyuda.length; i++) {
        botonesAyuda[i].setAttribute('aria-pressed', botonesAyuda[i] === this ? 'true' : 'false');
      }
      textoTipo.textContent = 'Tipo de ayuda: ' + tipo.charAt(0).toUpperCase() + tipo.slice(1);
      textoUbicacionAyuda.textContent = 'Ubicación aproximada: la de tu dispositivo';
      textoFicha.textContent = textoDeFicha();
      enviarSolicitud(tipo);
    });
  }

  // Cuando vuelve el internet, se envía la solicitud guardada
  window.addEventListener('online', function () {
    if (solicitudPendiente) {
      enviarSolicitud(solicitudPendiente);
    }
  });

  // "Cancelar": pide confirmación para evitar cancelar por error
  botonCancelar.addEventListener('click', function () {
    if (!solicitudActiva) {
      estadoAyuda.textContent = 'Estado: no hay ninguna solicitud activa.';
      return;
    }
    if (window.confirm('¿Cancelar la solicitud de ayuda?')) {
      solicitudActiva = false;
      solicitudPendiente = null;
      for (var i = 0; i < botonesAyuda.length; i++) {
        botonesAyuda[i].setAttribute('aria-pressed', 'false');
      }
      estadoAyuda.textContent = 'Estado: solicitud cancelada a las ' + horaActual() + '.';
    }
  });
}


// =====================================================================
// W-06 · Familiares: enviar una frase lista
// =====================================================================
var botonesFamilia = document.querySelectorAll('#enviar-frase input[type="button"]');

if (botonesFamilia.length > 0) {
  var cronologia = document.querySelector('.cronologia ul');
  cronologia.setAttribute('aria-live', 'polite');
  var mensajeFamilia = crearMensaje(document.querySelector('#enviar-frase h2'));

  for (var bfa = 0; bfa < botonesFamilia.length; bfa++) {
    botonesFamilia[bfa].addEventListener('click', function () {
      var frase = this.value;
      var item = document.createElement('li');
      item.textContent = horaActual() + ' · Enviaste: «' + frase + '»';
      cronologia.appendChild(item);
      mensajeFamilia.textContent = 'Frase enviada a tus familiares: «' + frase + '».';
    });
  }
}


// =====================================================================
// W-12 · Mis lugares: editar, agregar y guardar
// =====================================================================
var misLugares = document.getElementById('mis-lugares');

if (misLugares) {
  var listaLugares = misLugares.querySelector('.opciones-lugares');
  var botonAgregarLugar = misLugares.querySelector('.boton-agregar');
  var botonGuardarLugares = misLugares.querySelector('.agregar-lugares');
  var mensajeLugares = crearMensaje(misLugares.querySelector('.boton-agregar-lugares'));

  // Cada lugar tiene un h3 (nombre) y un p (dirección) dentro de .opciones-lugares > div
  function datosDeLugar(lugar) {
    return {
      nombre: lugar.querySelector('h3'),
      direccion: lugar.querySelector('h3 + p')
    };
  }

  // "Editar" cambia el nombre y la dirección por campos; "Listo" los guarda
  listaLugares.addEventListener('click', function (evento) {
    var boton = evento.target;
    if (!boton.classList.contains('editar')) {
      return;
    }
    var lugar = boton.closest('.opciones-lugares > div');
    var partes = datosDeLugar(lugar);

    if (boton.value === 'Editar') {
      var campoN = document.createElement('input');
      campoN.type = 'text';
      campoN.className = 'campo-lugar';
      campoN.value = partes.nombre.textContent;
      campoN.setAttribute('aria-label', 'Nombre del lugar');

      var campoD = document.createElement('input');
      campoD.type = 'text';
      campoD.className = 'campo-lugar';
      campoD.value = partes.direccion.textContent;
      campoD.setAttribute('aria-label', 'Dirección y zona');

      partes.nombre.hidden = true;
      partes.direccion.hidden = true;
      partes.direccion.after(campoD);
      partes.direccion.after(campoN);
      boton.value = 'Listo';
      campoN.focus();
    } else {
      var campos = lugar.querySelectorAll('.campo-lugar');
      if (campos[0].value.trim() === '') {
        mensajeLugares.textContent = 'El lugar necesita un nombre.';
        campos[0].focus();
        return;
      }
      partes.nombre.textContent = campos[0].value.trim();
      partes.direccion.textContent = campos[1].value.trim() === '' ? 'Sin dirección' : campos[1].value.trim();
      campos[0].remove();
      campos[1].remove();
      partes.nombre.hidden = false;
      partes.direccion.hidden = false;
      boton.value = 'Editar';
      mensajeLugares.textContent = 'Lugar actualizado: ' + partes.nombre.textContent + '. Pulsa «Guardar» para conservarlo.';
      boton.focus();
    }
  });

  // Crea un lugar con la misma estructura que los del HTML
  function crearLugar(nombre, direccion) {
    var lugar = document.createElement('div');
    lugar.className = 'ubicacion1';      // usa el mismo estilo que los demás
    lugar.innerHTML =
      '<div class="icono"><img src="../assets/icons/ubicacion.png" alt=""></div>' +
      '<div class="lugar-ubicacion1"><h3 class="nombre-ubicacion1"></h3><p class="descripcion-ubicacion1"></p></div>' +
      '<div class="editar-ubicacion1"><input type="button" class="editar" value="Editar"></div>';
    lugar.querySelector('h3').textContent = nombre;
    lugar.querySelector('p').textContent = direccion;
    return lugar;
  }

  // "+ Agregar lugar": agrega uno nuevo y lo abre para editar (máximo 5)
  botonAgregarLugar.addEventListener('click', function () {
    if (listaLugares.children.length >= 5) {
      mensajeLugares.textContent = 'Puedes tener hasta 5 lugares.';
      return;
    }
    var nuevo = crearLugar('Nuevo lugar', 'Escribe la dirección');
    listaLugares.appendChild(nuevo);
    nuevo.querySelector('.editar').click();     // se abre en modo edición
  });

  // "Guardar": guarda los lugares y qué avisos recibe
  botonGuardarLugares.addEventListener('click', function () {
    if (listaLugares.querySelector('.campo-lugar')) {
      mensajeLugares.textContent = 'Termina de editar (pulsa «Listo») antes de guardar.';
      return;
    }
    var lugares = [];
    for (var i = 0; i < listaLugares.children.length; i++) {
      var partes = datosDeLugar(listaLugares.children[i]);
      lugares.push({ nombre: partes.nombre.textContent, direccion: partes.direccion.textContent });
    }
    var datos = {
      lugares: lugares,
      zonaActual: document.getElementById('aviso-zona-actual').checked,
      lugaresGuardados: document.getElementById('aviso-lugares-guardados').checked
    };
    if (guardarDato('alerta360-lugares', datos)) {
      mensajeLugares.textContent = 'Lugares guardados (' + lugares.length + ').';
    } else {
      mensajeLugares.textContent = 'No se pudo guardar en este navegador.';
    }
  });

  // Al abrir la página: recupera los lugares guardados
  var lugaresGuardados = leerDato('alerta360-lugares');
  if (lugaresGuardados) {
    listaLugares.innerHTML = '';
    for (var lg = 0; lg < lugaresGuardados.lugares.length; lg++) {
      listaLugares.appendChild(crearLugar(lugaresGuardados.lugares[lg].nombre, lugaresGuardados.lugares[lg].direccion));
    }
    document.getElementById('aviso-zona-actual').checked = lugaresGuardados.zonaActual;
    document.getElementById('aviso-lugares-guardados').checked = lugaresGuardados.lugaresGuardados;
  }
}


// =====================================================================
// W-13 · Fin de la emergencia: "Entendido"
// =====================================================================
var botonEntendido = document.querySelector('.boton-entendido');

if (botonEntendido) {
  var mensajeFin = crearMensaje(botonEntendido);

  botonEntendido.addEventListener('click', function () {
    var casillas = document.querySelectorAll('#fin-emergencia .item-volver input');
    var faltan = 0;
    for (var i = 0; i < casillas.length; i++) {
      if (!casillas[i].checked) {
        faltan = faltan + 1;
      }
    }
    if (faltan > 0) {
      mensajeFin.textContent = 'Te faltan ' + faltan + ' punto(s) de la lista «Antes de volver». Revísalos con calma.';
      return;
    }
    mensajeFin.textContent = 'Listo. Vuelve con calma. Tus contactos ya saben que estás bien.';
    botonEntendido.value = '✓ Entendido';
  });
}
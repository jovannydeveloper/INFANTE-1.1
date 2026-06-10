// ── Datos de las semanas del programa ──
const semanas = [
  {
    numero: "Semana 1",
    titulo: "El mapa oculto del azúcar",
    imagen: "assets/img/programa/semana-1.jpeg",
    parrafos: [
      "El programa inicia con una fase de conciencia y observación. En esta semana, aprenderás a identificar la presencia del azúcar en tu entorno cotidiano, incluyendo productos donde suele pasar desapercibida.",
      "Se explora cómo el consumo frecuente de azúcares añadidos puede influir en la energía, el apetito y la toma de decisiones alimentarias.",
      "A nivel emocional, se comienza a cuestionar el piloto automático con el que muchas veces se eligen los alimentos, desarrollando una mirada más consciente y libre de juicio."
    ]
  },
  {
    numero: "Semana 2",
    titulo: "El origen de lo dulce",
    imagen: "assets/img/programa/semana-2.jpeg",
    parrafos: [
      "En esta etapa se profundiza el origen biológico y emocional del gusto por lo dulce.",
      "Se aborda cómo la preferencia por el azúcar tiene bases evolutivas, así como la forma en que las experiencias tempranas y los vínculos afectivos influyen en la relación con la comida.",
      "También se explica, de manera clara y accesible, cómo el sistema de recompensa del cerebro responde al azúcar y cómo esto puede generar hábitos repetitivos."
    ]
  },
  {
    numero: "Semana 3",
    titulo: "El cuerpo dolido, vivo y en reparación",
    imagen: "assets/img/programa/semana-3.jpeg",
    parrafos: [
      "Esta semana está enfocada en la reconexión con el cuerpo.",
      "Se explora cómo el consumo excesivo de azúcar puede relacionarse con síntomas como fatiga, fluctuaciones de energía y malestar físico (desde un enfoque equilibrado y sin alarmismo).",
      "Aprenderás a escuchar las señales corporales y diferenciar entre energía real y estímulos temporales, fortaleciendo la confianza en tu propio cuerpo."
    ]
  },
  {
    numero: "Semana 4",
    titulo: "Hambre emocional",
    imagen: "assets/img/programa/semana-4.jpeg",
    parrafos: [
      "Aquí se aborda uno de los pilares del programa: la relación entre emociones y alimentación.",
      "Se explica cómo la ansiedad, el estrés o el vacío pueden influir en los antojos, especialmente hacia alimentos dulces.",
      "Se diferencia entre hambre física y emocional, y se introducen herramientas prácticas para identificar lo que realmente se necesita en cada momento.",
      "El enfoque no es restringir, sino comprender y regular."
    ]
  },
  {
    numero: "Semana 5",
    titulo: "Azúcar y trauma",
    imagen: "assets/img/programa/semana-5.jpeg",
    parrafos: [
      "En esta fase se profundiza el uso excesivo de azúcar como una posible forma de regulación emocional frente a experiencias difíciles.",
      "Se trabaja desde una perspectiva respetuosa y cuidadosa, entendiendo que ciertos patrones alimentarios pueden estar vinculados a estrategias de afrontamiento desarrolladas a lo largo de la vida.",
      "Aprenderas a identificar cuándo el azúcar ha funcionado como un recurso emocional y comienzas a desarrollar alternativas más saludables de contención interna.",
      "Descubrirás a transformar la relación con el azúcar desde la comprensión emocional, no desde la restricción"
    ]
  },
  {
    numero: "Semana 6",
    titulo: "Rediseña tu placer",
    imagen: "assets/img/programa/semana-6.jpeg",
    parrafos: [
      "El programa cierra con una etapa de integración y construcción de nuevos hábitos.",
      "Rediseñaras tu concepto de placer, incorporando opciones más equilibradas y sostenibles que no dependan exclusivamente del azúcar.",
      "Se trabajan rituales conscientes, sustituciones prácticas y nuevas formas de bienestar que fortalecen la autonomía y el autocuidado.",
      "Podrás construir una relación más libre, consciente y equilibrada con el placer y la alimentación."
    ]
  }
];

// ── Renderizador de semanas ──
function renderSemanas() {
  const container = document.getElementById("semanas-container");
  if (!container) return;

  container.innerHTML = semanas.map((semana, index) => {
    // Semanas pares tienen imagen a la derecha (order-lg-2)
    const imagenDerecha = index % 2 !== 0;
    const ordenImagen = imagenDerecha ? 'order-lg-2' : '';

    const parrafosHTML = semana.parrafos
      .map(p => `<p class="producto-desc">${p}</p>`)
      .join('');

    return `
      <div class="producto-row producto-row--reverse row g-0 align-items-center">
        <div class="col-lg-6 ${ordenImagen} producto-img-col">
          <div class="producto-img-wrap producto-img-wrap--coral">
            <div class="producto-img-inner" style="background-image: url('${semana.imagen}')"></div>
          </div>
        </div>
        <div class="col-lg-6 order-lg-1 producto-text-col">
          <div class="producto-text">
            <span class="producto-numero">${semana.numero}</span>
            <h3 class="producto-titulo">${semana.titulo}</h3>
            ${parrafosHTML}
          </div>
        </div>
      </div>`;
  }).join('');
}

renderSemanas();
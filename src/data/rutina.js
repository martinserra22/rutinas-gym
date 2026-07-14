/* Programa W2 · Martín Serra · inicio 13/1/26
   La rutina vive en código (no en la DB) porque es fija por 8 semanas.
   Cuando el profe entregue el programa nuevo, se edita este archivo. */

export const WEEKS = 8;

export const ABS = {
  id: "abs",
  title: "Abdominales",
  focus: "Se hacen todos los días, antes de la rutina",
  ex: [
    {
      n: "Bisagras cruzadas + hollow rock",
      s: 3, r: '20 + 20"',
      d: "Biserie: 20 bisagras cruzadas (tocás la rodilla contraria con el codo) y sin descanso 20 segundos de hollow rock (cuerpo en banana, balanceo corto con la zona lumbar pegada al piso).",
    },
    {
      n: "Abs sup. + oblicuos + inf. tijeras",
      s: 3, r: "20",
      d: "Triserie de 20 repeticiones cada una: encogimientos para abdominales superiores, giros u oblicuos, y tijeras para la parte inferior.",
    },
  ],
};

export const DAYS = [
  {
    id: "d1", num: 1, focus: "Pecho · Hombros · Tríceps",
    ex: [
      { n: "Press vertical máq. discos", s: 4, r: "12", d: "Press de pecho en máquina de discos: espalda bien apoyada, empujá las manijas al frente y no trabes los codos al final." },
      { n: "Press inclinado c/ mancuernas", s: 3, r: "12-15", d: "Banco a 30-45°. Bajá las mancuernas al costado del pecho y empujá hacia arriba juntándolas apenas. Trabaja el pecho superior." },
      { n: "Aperturas peck deck", s: 4, r: "12", d: "Sentado en la máquina, brazos semiflexionados. Juntá los agarres al frente apretando el pecho y volvé controlado." },
      { n: "Press de hombro c/ barra", s: 3, r: "8-10", d: "Desde los hombros hacia arriba, core firme y sin arquear la zona lumbar. Puede ser sentado o parado." },
      { n: "Vuelos laterales sentado + parado", s: 3, r: "8+8", d: "Biserie: 8 vuelos laterales sentado y, sin pausa, 8 parado. Codos apenas flexionados, subí hasta la línea de los hombros." },
      { n: "Tríceps triángulo + tras nuca c/ manc.", s: 3, r: "10+10", d: "Biserie: extensión en polea con agarre triángulo (codos pegados al cuerpo) + extensión tras nuca con una mancuerna a dos manos." },
    ],
  },
  {
    id: "d2", num: 2, focus: "Espalda · Bíceps",
    ex: [
      { n: "Dorsalera convergente", s: 4, r: "12", d: "Jalón en máquina convergente: pecho afuera, tirá los agarres hacia el pecho llevando los codos abajo y atrás." },
      { n: "Remo Dorian", s: 3, r: "15", d: "Remo con torso inclinado estilo Yates (~70°), agarre supino. Llevá la barra al abdomen bajo apretando la espalda." },
      { n: "Escapular en máquina", s: 3, r: "12", d: "Retracción de escápulas: brazos casi estirados, juntá los omóplatos atrás sin flexionar mucho los codos. Espalda media." },
      { n: "Remo bajo cerrado", s: 3, r: "8", d: "Remo en polea baja con agarre cerrado (triángulo). Tirá hacia el abdomen con el torso firme, sin hamacarte." },
      { n: "Bíceps barra en polea", s: 3, r: "15", d: "Curl con barra en polea baja: codos fijos al costado del cuerpo, subí controlado y bajá lento." },
      { n: "Bíceps martillo c/ mancuernas", s: 3, r: "8-10", d: "Curl martillo con agarre neutro (palmas enfrentadas). Trabaja bíceps y antebrazo." },
    ],
  },
  {
    id: "d3", num: 3, focus: "Piernas",
    ex: [
      { n: "Silla extensora", s: 4, r: "12", d: "Extensión de rodillas en máquina: subí hasta estirar casi por completo y bajá controlado. Cuádriceps." },
      { n: "Prensa hack", s: 4, r: "10", d: "Sentadilla en máquina hack: pies al ancho de hombros, bajá profundo con la espalda apoyada y empujá con toda la planta." },
      { n: "Silla aductora", s: 4, r: "20", d: "Aducción en máquina: juntá las piernas contra la resistencia y volvé lento. Cara interna del muslo." },
      { n: "Estocada en el lugar", s: 3, r: "8 c/pierna", d: "Zancada estática: un pie adelante, bajá la rodilla de atrás hacia el piso y subí. Completá las repes de un lado y cambiá." },
      { n: "Silla de femorales unilateral", s: 3, r: "10", d: "Curl femoral de a una pierna en máquina: llevá el talón hacia el glúteo y frená la bajada." },
      { n: "Sóleo en máquina", s: 3, r: "20", d: "Elevación de talones sentado (rodilla flexionada apunta al sóleo): subida completa y pausa arriba." },
    ],
  },
  {
    id: "d4", num: 4, focus: "Pecho · Tríceps",
    ex: [
      { n: "Pecho plano convergente", s: 4, r: "12-15", d: "Press plano en máquina convergente: los brazos convergen al frente, apretá el pecho al cerrar." },
      { n: "Pecho inclinado máq. 2", s: 3, r: "10", d: "Press inclinado en la máquina 2: empuje hacia arriba y adelante, foco en pecho superior." },
      { n: "Flexiones", s: 3, r: "al fallo", d: "Flexiones de brazos hasta el fallo en cada serie: cuerpo en línea, pecho cerca del piso, subida completa. Anotá cuántas salieron." },
      { n: "Vuelos L manc. + vuelos F c/ disco", s: 3, r: "10+8", d: "Biserie: 10 vuelos laterales con mancuernas + 8 vuelos frontales sosteniendo un disco a dos manos." },
      { n: "Tríceps polea soga + fondos máq.", s: 3, r: "12+20", d: "Biserie: 12 extensiones en polea con soga (abrí la soga abajo) + 20 fondos en máquina asistida o de tríceps." },
    ],
  },
  {
    id: "d5", num: 5, focus: "Espalda · Bíceps · Lumbar",
    ex: [
      { n: "Remo a caballo agarre neutro", s: 4, r: "15", d: "Remo T (a caballo) con agarre neutro: pecho apoyado o torso inclinado, tirá los codos atrás apretando la espalda." },
      { n: "Remo Dorian agarre prono", s: 3, r: "12", d: "Remo inclinado estilo Yates con agarre prono (palmas hacia abajo). Barra al abdomen, espalda firme." },
      { n: "Remo bajo", s: 3, r: "8-10", d: "Remo en polea baja: tirá hacia el abdomen manteniendo el torso quieto y las escápulas juntas al final." },
      { n: "Silla romana", s: 3, r: "15", d: "Extensión lumbar en banco romano: bajá el torso controlado y subí hasta la línea del cuerpo, sin hiperextender." },
      { n: "Bíceps bombas sentado + polea soga", s: 3, r: "12", d: "Biserie: curl 'bombas' sentado (concentrado, apoyando el codo) + curl en polea con soga, agarre neutro." },
    ],
  },
];

export const ALL_BLOCKS = [ABS, ...DAYS];

/* Valores de la hoja de papel (semanas 1 a 5). Se muestran como fallback
   cuando no hay valor guardado en la DB para esa celda: por eso no hace
   falta hacer seed. Si el usuario edita una celda, la DB pisa esto. */
export const PRE = {
  d1: [
    ["10kg", "10kg", "25kg", "15kg", "20kg"],
    ["8kg", "20kg", "10kg", "15kg", "8kg"],
    ["3P", "2P", "3P", "3P", "15kg"],
    ["4P", "15kg", "20kg", "20kg", "20kg"],
    ["7,5kg", "5kg", "8kg", "7,5kg", "7,5"],
    ["4P", "4P", "6P/5P", "6P", "6P"],
  ],
  d2: [
    ["10kg", "10kg", "10kg", "15kg", "20kg"],
    ["25kg", "20kg", "20kg", "30kg", "30kg"],
    ["6P", "6P", "6P", "6P", "7P"],
    ["5P", "7P", "7P", "7P", "7P"],
    ["5P", "5P", "5P", "6P", "5P"],
    ["8kg", "5kg", "7,5kg", "7,5kg", "8kg"],
  ],
  d3: [
    ["6P", "7P", "7P", "7P", "7P"],
    ["60kg", "60kg", "60kg", "60kg", "60kg"],
    ["5P", "6P", "6P", "6P", "6P"],
    ["10kg", "8kg", "8kg", "60kg", "8"],
    ["5P", "5P", "5P", "4kg", "5kg"],
    ["15kg", "10kg", "15kg", "15kg", "15"],
  ],
  d4: [
    ["15kg", "20kg", "15kg", "15", "10"],
    ["10kg", "8kg", "15kg", "15", "10"],
    ["3x28", "3x25", "3x25", "3x25", "3x20"],
    ["8/10kg", "7,5/10kg", "7,5/10kg", "8/10", "7,5/10"],
    ["5P/7P", "5P/7P", "6P/7P", "6/7", "5/7"],
  ],
  d5: [
    ["20kg", "20kg", "20kg", "20kg", "20kg"],
    ["25kg", "25kg", "25kg", "30", "30kg"],
    ["7P", "7P", "7P", "7P", "7P"],
    ["3x15", "3x15", "3x15", "3x15", "3x15"],
    ["7,5/5P", "7,5/5P", "8/6P", "7,5/6P", "8/6"],
  ],
};

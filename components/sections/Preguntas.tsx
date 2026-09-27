import { MazoConDescripcion, type PreguntaCarta } from '@/components/UI/MazoConDescripcion'

/** TEXTO DE EJEMPLO: hay que reemplazar las preguntas por las reales. */
const PREGUNTAS: PreguntaCarta[] = [
	{
		numeral: 'I',
		etiqueta: 'Antes de reservar',
		tema: 'La hora exacta',
		imagen: '/geometry.jpeg',
		pregunta: '¿Necesito saber mi hora de nacimiento?',
		respuesta:
			'Para la carta natal sí, y lo más precisa posible: la hora define las casas, que son la mitad de la lectura. Si no la tenés, se puede pedir el acta de nacimiento o trabajar con una rectificación aproximada. Avisame antes y lo resolvemos juntas.',
	},
	{
		numeral: 'II',
		etiqueta: 'Antes de reservar',
		tema: 'Creer o no creer',
		imagen: '/sun_and_letters.jpeg',
		pregunta: '¿Qué pasa si no creo del todo en esto?',
		respuesta:
			'No hace falta que creas en nada. Las cartas y la carta natal son un lenguaje simbólico: funcionan como espejo, no como oráculo infalible. Mucha gente llega escéptica y se va con preguntas mejores, que es exactamente de lo que se trata.',
	},
	{
		numeral: 'III',
		etiqueta: 'Durante la sesión',
		tema: 'Presencial u online',
		imagen: '/sun_and_moon.jpeg',
		pregunta: '¿Las sesiones son presenciales o por videollamada?',
		respuesta:
			'Las dos cosas. Atiendo en un consultorio sobre Córdoba, en Roma Sur, y también por videollamada. La sesión es exactamente la misma: cambia el lugar, no el trabajo. Hoy la mitad de mis consultas son a distancia.',
	},
	{
		numeral: 'IV',
		etiqueta: 'Durante la sesión',
		tema: 'Preguntar por otro',
		imagen: '/moon_and_stars.jpeg',
		pregunta: '¿Puedo consultar por otra persona?',
		respuesta:
			'Podés traer un vínculo —una pareja, un socio, tu mamá— y lo miramos desde tu lugar en esa historia. Lo que no hago es leer la carta de alguien que no está y no pidió la lectura. No es un límite místico, es de respeto.',
	},
	{
		numeral: 'V',
		etiqueta: 'Después',
		tema: 'Reservas y pagos',
		imagen: '/sun.jpeg',
		pregunta: '¿Cómo reservo y cómo se paga?',
		respuesta:
			'Escribime por el formulario o por WhatsApp y te paso la disponibilidad. Se reserva con el 50% por transferencia y el resto el día de la sesión. Si necesitás reprogramar, avisame con 24 horas de anticipación y no hay problema.',
	},
]

/**
 * Preguntas frecuentes — cada pregunta es una carta del mazo.
 *
 * El mazo va `aria-hidden` y el texto accesible vive en el panel: si no, un
 * lector de pantalla tendría que barajar cinco veces para leerlo todo.
 */
export function Preguntas() {
	return (
		<section
			id="preguntas"
			aria-labelledby="preguntas-title"
			className="relative isolate mx-auto w-full max-w-pagina overflow-hidden px-6 pb-20 pt-14 md:px-margen md:pb-seccion md:pt-seccion-s"
		>
			{/* El grabado necesita `mix-blend-screen` y la máscara radial: opaco
			    queda un parche gris, y sin máscara se ve el borde del archivo. */}
			<div
				aria-hidden
				className="pointer-events-none absolute left-1/2 top-0 -z-10 aspect-[736/974] w-[min(88vw,720px)] -translate-x-1/2 bg-[url('/hands.jpg')] bg-contain bg-top bg-no-repeat opacity-[0.28] mix-blend-screen [mask-image:radial-gradient(ellipse_at_center,#000_35%,transparent_72%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,#000_35%,transparent_72%)]"
			/>

			<MazoConDescripcion preguntas={PREGUNTAS}>
				<p className="font-mono text-etiqueta uppercase text-gold">
					(06) — Preguntas frecuentes
				</p>
				<h2
					id="preguntas-title"
					className="mt-5 font-heading text-titulo-l font-normal text-fg-primary"
				>
					Preguntas frecuentes
				</h2>
			</MazoConDescripcion>
		</section>
	)
}

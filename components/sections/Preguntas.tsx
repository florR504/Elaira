import {
	MazoConDescripcion,
	type PreguntaCarta,
} from '@/components/UI/MazoConDescripcion'

/**
 * TEXTO DE EJEMPLO. Las cinco preguntas y sus respuestas son placeholder:
 * están escritas con la voz del sitio para que se vea el largo real, pero hay
 * que reemplazarlas por las que de verdad te hacen.
 */
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
 * Preguntas frecuentes — cada pregunta es una carta del mazo. Al barajar
 * cambia la respuesta del panel.
 *
 * El mazo es `aria-hidden` porque muestra una carta por vez y obligaría a un
 * lector de pantalla a barajar cinco veces. Las preguntas y respuestas
 * completas viven en el panel, que sí es accesible y cambia con la carta.
 */
export function Preguntas() {
	return (
		<section
			id="preguntas"
			aria-labelledby="preguntas-title"
			className="relative isolate mx-auto w-full max-w-[1440px] overflow-hidden px-6 py-20 md:px-[60px] md:py-[120px]"
		>
			{/* Grabado de fondo. Va en mix-blend-screen: el negro de la lámina
			    desaparece contra el fondo y queda solo la línea dorada, como si
			    estuviera impresa sobre el paño. Opaca quedaría un parche gris.
			    Tamaño acotado y centrado en vez de `cover`: la lámina es vertical
			    y tiene marco propio, estirarla de borde a borde la rompe.
			    La máscara radial es necesaria: el fondo de la lámina no es negro
			    puro sino gris texturado, así que `screen` levanta todo el
			    rectángulo y se ve el borde del archivo. */}
			<div
				aria-hidden
				className="pointer-events-none absolute left-1/2 top-0 -z-10 aspect-[736/974] w-[min(88vw,720px)] -translate-x-1/2 bg-[url('/servicios-fondo.jpg')] bg-contain bg-top bg-no-repeat opacity-[0.28] mix-blend-screen [mask-image:radial-gradient(ellipse_at_center,#000_35%,transparent_72%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,#000_35%,transparent_72%)]"
			/>

			<MazoConDescripcion preguntas={PREGUNTAS}>
				<p className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold">
					(04) — Preguntas frecuentes
				</p>
				<h2
					id="preguntas-title"
					className="mt-5 font-heading text-[clamp(2.5rem,6vw,88px)] font-normal leading-[1.05] tracking-[-0.028em] text-fg-primary"
				>
					Lo que más me preguntan
				</h2>
			</MazoConDescripcion>

			<div className="mt-24 flex flex-col gap-6 border-t border-hairline pt-12 md:mt-32 md:flex-row md:items-center md:justify-between md:gap-16">
				<div className="md:max-w-[560px]">
					<h3 className="font-heading text-[clamp(1.75rem,2.2vw,32px)] font-normal tracking-[-0.02em] text-fg-primary">
						¿Te quedó una pregunta que no está acá?
					</h3>
					<p className="mt-3 text-[15px] leading-[1.65] text-fg-secondary">
						Escribime y te contesto yo, sin formularios automáticos ni respuestas
						armadas. Si la pregunta le sirve a alguien más, después la sumo a esta
						lista.
					</p>
				</div>
				<a
					href="#contacto"
					className="flex h-[50px] shrink-0 items-center justify-center gap-2.5 border border-gold px-7 font-mono text-[11px] tracking-[0.18em] text-gold-bright transition-colors hover:bg-gold hover:text-surface-primary"
				>
					ESCRIBIME
					<span aria-hidden>↗</span>
				</a>
			</div>
		</section>
	)
}

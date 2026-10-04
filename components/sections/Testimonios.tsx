import { CarruselTestimonios, type Testimonio } from '@/components/UI/CarruselTestimonios'

/** TEXTO DE EJEMPLO: hay que reemplazarlos por los reales, con nombre y permiso. */
const TESTIMONIOS: Testimonio[] = [
	{
		id: 'malena',
		cita: 'Llegué buscando que alguien me dijera qué hacer y me fui entendiendo por qué venía postergando la decisión hace dos años.',
		nombre: 'Malena R.',
		servicio: 'Carta natal',
		lugar: 'Buenos Aires',
	},
	{
		id: 'tomas',
		cita: 'No me dijo nada que yo no supiera. Me lo ordenó de una manera en la que por fin lo pude mirar de frente.',
		nombre: 'Tomás V.',
		servicio: 'Progresiones',
		lugar: 'Montevideo',
	},
	{
		id: 'carla-y-nico',
		cita: 'Lo hicimos juntos después de seis años de pareja. Salimos hablando de cosas que nunca habíamos podido nombrar.',
		nombre: 'Carla y Nico',
		servicio: 'Sinastría',
		lugar: 'Córdoba',
	},
	{
		id: 'ines',
		cita: 'El PDF lo releo cada tanto y siempre encuentro algo distinto. No es un informe, es una carta escrita para mí.',
		nombre: 'Inés M.',
		servicio: 'Carta natal',
		lugar: 'Ciudad de México',
	},
	{
		id: 'javier',
		cita: 'Era escéptico y lo sigo siendo. Igual fue la conversación más honesta que tuve sobre mi trabajo en todo el año.',
		nombre: 'Javier P.',
		servicio: 'Lectura de oráculo',
		lugar: 'Santiago',
	},
	{
		id: 'valeria',
		cita: 'Reservé las dos cosas juntas sin saber bien por qué. La carta me explicó de dónde venía y la tirada me dijo qué hacer el lunes.',
		nombre: 'Valeria S.',
		servicio: 'Combo cósmico',
		lugar: 'Rosario',
	},
]

/**
 * Testimonios — bloque claro, tres citas por página.
 *
 * El color va en la `<section>` y el ancho máximo en la caja de adentro: con
 * los dos en el mismo elemento, arriba de 1440 queda una franja crema flotando.
 */
export function Testimonios() {
	return (
		<section
			id="testimonios"
			aria-labelledby="testimonios-title"
			className="w-full bg-surface-bone"
		>
			<div className="mx-auto w-full max-w-pagina px-6 py-28 md:px-margen md:py-seccion">
				<div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between md:gap-10">
					<p className="font-mono text-etiqueta uppercase text-accent-olive">
						(04) — Testimonios
					</p>
					<p className="font-mono text-etiqueta uppercase text-fg-on-bone-soft">
						Consultantes 2019 — 2026
					</p>
				</div>

				<h2
					id="testimonios-title"
					className="mt-6 max-w-[18ch] font-heading text-titulo-l font-normal text-fg-on-bone"
				>
					Lo que queda <em className="italic text-accent-olive">después</em> de la sesión
				</h2>

				<CarruselTestimonios testimonios={TESTIMONIOS} />
			</div>
		</section>
	)
}

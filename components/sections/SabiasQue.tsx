import { SecuenciaLunar, type FaseLunar } from '@/components/UI/SecuenciaLunar'

/**
 * TEXTO DE EJEMPLO. Las ocho lecturas son placeholder: están escritas con la
 * voz del sitio y el largo que tendrían las reales, pero hay que reemplazarlas
 * por las tuyas.
 *
 * El orden arranca en luna llena y recorre el ciclo hasta volver a ella, que es
 * el orden de los fotogramas.
 */
const FASES: FaseLunar[] = [
	{
		nombre: 'Luna llena',
		descripcion:
			'Naciste con todo a la vista. Tu carta tiende a la expresión: lo que sentís se nota antes de que lo digas, y aprender a dosificar esa luz suele ser el trabajo de una vida.',
	},
	{
		nombre: 'Gibosa menguante',
		descripcion:
			'Llegaste justo después del punto máximo. Sos de quienes entienden las cosas mientras las explican, y necesitan compartir lo que descubren para terminar de creerlo.',
	},
	{
		nombre: 'Cuarto menguante',
		descripcion:
			'Naciste en el momento de soltar. Se te da revisar, corregir y desarmar lo que ya no sirve — y te cuesta más empezar de cero que reconstruir sobre lo que había.',
	},
	{
		nombre: 'Balsámica',
		descripcion:
			'La fase más silenciosa del ciclo. Quienes nacen acá suelen sentirse un paso afuera de su época, y encuentran su lugar cuando dejan de pelear contra esa distancia.',
	},
	{
		nombre: 'Luna nueva',
		descripcion:
			'Empezaste con la página en blanco. Hay un impulso de arranque que no se apaga: se te dan los comienzos, aunque no siempre estés para ver cómo terminan.',
	},
	{
		nombre: 'Creciente',
		descripcion:
			'Naciste con el primer envión ya dado. Tu desafío es sostener lo que empezaste cuando deja de ser novedoso, que es justo donde se decide si algo existe o no.',
	},
	{
		nombre: 'Cuarto creciente',
		descripcion:
			'La fase de la crisis fértil. Te formaste empujando contra algo, y la tensión no es un obstáculo en tu carta: es el motor con el que construís.',
	},
	{
		nombre: 'Gibosa creciente',
		descripcion:
			'Casi llena, todavía en camino. Hay una exigencia de perfeccionar antes de mostrar, y el aprendizaje es soltar la obra aunque no esté terminada del todo.',
	},
]

/**
 * Sabías que — la fase lunar del día en que naciste.
 *
 * Es la única sección que se fija al viewport además del hero: la luna se queda
 * quieta y el ciclo avanza con el scroll. Por eso va después de testimonios y
 * antes de preguntas, donde el recorrido ya aflojó y una pausa larga no
 * interrumpe nada.
 */
export function SabiasQue() {
	return (
		<section
			id="sabias-que"
			aria-labelledby="sabias-que-title"
			className="relative w-full bg-surface-primary"
		>
			<div className="mx-auto w-full max-w-pagina px-6 pt-28 md:px-margen md:pt-seccion">
				<p className="font-mono text-etiqueta uppercase text-gold">(05) — Sabías que</p>
				<h2
					id="sabias-que-title"
					className="mt-6 max-w-[20ch] font-heading text-titulo-l font-normal text-fg-primary"
				>
					La Luna estaba en una fase exacta cuando{' '}
					<em className="italic text-gold-bright">naciste</em>
				</h2>
				<p className="mt-8 max-w-[46ch] text-cuerpo text-fg-secondary">
					No es lo mismo llegar al mundo con la Luna creciendo que con la Luna apagándose.
					Esa fase describe desde qué lugar empezás las cosas. Recorré el ciclo y buscá la
					tuya.
				</p>
			</div>

			<SecuenciaLunar fases={FASES} />
		</section>
	)
}

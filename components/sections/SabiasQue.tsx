import { SecuenciaLunar, type FaseLunar } from '@/components/UI/SecuenciaLunar'

/**
 * TEXTO DE EJEMPLO. Las ocho lecturas son placeholder: están escritas con la
 * voz del sitio y el largo que tendrían las reales, pero hay que reemplazarlas
 * por las tuyas.
 *
 * El recorrido va de luna llena a luna nueva y ahí termina: de la nueva en
 * adelante la Luna vuelve a crecer y las siluetas repiten las de esta mitad,
 * espejadas.
 */
const FASES: FaseLunar[] = [
	{
		nombre: 'Luna llena',
		descripcion:
			'ILUMINACIÓN · RELACIÓN  Sos un alma que llega esta vida para ver claro - a si misma y a los demás. Tu consciencia es amplia, panorámica. Misión: vivir tus relaciones como espejos de crecimiento. Es a través del vínculo que tu alma se revela.',
	},
	{
		nombre: 'Gibosa menguante',
		descripcion:
			'TRANSMISIÓN · ENSEÑANZA Sos un alma que llega para compartir lo que sabe. Naciste con una vocación pedagógica, comunicacional, mediática. Misión: transmitir tu experiencia y tu sabiduría al mundo. Escribir, enseñar, hablar, crear contenido.',
	},
	{
		nombre: 'Cuarto menguante',
		descripcion:
			'CRISIS DE CONSCIENCIA · REBELDÍA Sos un alma que cuestiona los sistemas heredados. Naciste con una capacidad natural para ver lo que ya no funciona y desafiarlo. Reto: No quedarte solo en la crítica. Después de desconstruir, hay que reconstruir con visión propia.',
	},
	{
		nombre: 'Balsámica',
		descripcion:
			'LIBERACIÓN · SABIDURÍA ANTIGUA Sos un alma vieja llegando al final de un gran ciclo. Traés mucha sabiduría acumulada - a veces tanto que te cuesta encajar en este mundo. Misión: soltar lo que ya no te pertenece, transmitir tu sabiduría a los pocos que puedan recibirla, prepararte para el próximo gran ciclo.',
	},
	{
		nombre: 'Luna nueva',
		descripcion:
			'Empezaste con la página en blanco. Hay un impulso de arranque que no se apaga: se te dan los comienzos, aunque no siempre estés para ver cómo terminan.',
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
					La memoria lunar de <em className="italic text-gold-bright">tu encarnación</em>
				</h2>
				<p className="mt-8  text-cuerpo text-fg-secondary">
					La astrología popular te habla mucho de tu Sol, tu Luna y tu Ascendente Pero muy
					pocos te hablan de la fase lunar en la que naciste. Y sin embargo esta
					enformación revela algo profundo: en que momento del ciclo evolutivo te
					encuentras al llegar a esta vida.
				</p>
			</div>

			<SecuenciaLunar fases={FASES} />
		</section>
	)
}

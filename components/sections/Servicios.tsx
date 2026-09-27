import { SliderServicios } from '@/components/UI/SliderServicios'
import { TextoEnmascarado } from '@/components/UI/TextoEnmascarado'

/**
 * TEXTO DE EJEMPLO. Los nombres son los definitivos; descripciones, precios,
 * duraciones e "incluye" son placeholder.
 */
const SERVICIOS = [
	{
		numero: '01',
		nombre: 'Carta Natal',
		imagen: '/carta_natal_2.jpg',
		ancho: 851,
		alto: 1063,
		alt: 'Lámina con la rueda de fases lunares y geometría sagrada',
		descripcion:
			'¿Sentís que hay algo en vos que aún no lograste nombrar? Tu carta natal es el mapa exacto del momento en que tu alma decidió encarnar.',
		incluye: 'AMOR · VOCACIÓN · DINERO · FAMILIA · CUERPO · SALUD · MISIÓN · DONES · HERIDA',
		duracion: '55-60 páginas · PDF personalizado · escritura personal',
		precio: 'USD 95',
		cta: 'Reservar',
	},
	{
		numero: '02',
		nombre: 'Progresiones',
		imagen: '/ejemplo.jpg',
		ancho: 675,
		alto: 1200,
		alt: 'Lámina con soles y estrellas grabados',
		descripcion:
			'¿Sentís que estás atravesando un cambio interior que aún no sabés nombrar? Tu carta natal es fija, vos no. Las progresiones revelan en que momento te encontrás ahora.',
		incluye: 'EVOLUCIÓN · CICLOS · ALMA · ALINEACIÓN · UMBRAL · RENACIMIENTO · DIRECCIÓN',
		duracion: '55-60 páginas · PDF personalizado · escritura personal',
		precio: 'USD 95',
		cta: 'Consultar',
	},
	{
		numero: '03',
		nombre: 'Sinastría',
		imagen: '/sinastry_5.jpg',
		ancho: 736,
		alto: 1165,
		alt: 'Lámina con un sol y una luna enfrentados',
		descripcion:
			'¿Sentís que hay un vínculo en tu vida que te transforma más profundamente de lo que podés explicar? Cuando dos cartas se encuentran se forma una arquitectura invisible entre las almas.',
		incluye:
			'AMOR · AMISTAD · SEXUALIDAD · CARRERAS · RUTINA · VIDAS PASADAS · DURABILIDAD · RECIPROCIDAD · COMUNICACIÓN',
		duracion:
			'Análisis del vínculo entre dos cartas natales · 55-60 páginas · PDF personalizado',
		precio: 'USD 165',
		cta: 'Consultar',
	},
	{
		numero: '04',
		nombre: 'Lectura de oráculo',
		imagen: '/oracle.jpg',
		ancho: 900,
		alto: 1200,
		alt: 'Lámina con una luna y estrellas grabadas',
		descripcion:
			'Una pregunta concreta y una tirada. La sesión más corta y la más directa: para cuando necesitás claridad sobre algo que está pasando ahora.',
		incluye: 'Grabada · Una pregunta',
		duracion: '45 MIN',
		precio: 'MXN 1,100',
		cta: 'Reservar',
	},
	{
		numero: '05',
		nombre: 'Combo cósmico',
		imagen: '/red_gloves.jpeg',
		ancho: 736,
		alto: 1318,
		alt: 'Lámina con un sol radiante grabado',
		descripcion:
			'Carta natal y lectura de oráculo en un mismo encuentro, con un descanso en el medio. Primero el mapa completo, después la pregunta puntual.',
		incluye: 'Carta natal + oráculo · Resumen escrito',
		duracion: '120 MIN',
		precio: 'MXN 3,600',
		cta: 'Reservar',
	},
]

/** Mi propósito, en bloque claro, y los servicios en un slider horizontal. */
export function Servicios() {
	return (
		<>
			<section
				id="proposito"
				aria-labelledby="servicios-title"
				className="w-full bg-surface-bone"
			>
				<div className="mx-auto w-full max-w-pagina px-6 py-28 md:px-margen md:py-seccion">
					<p className="font-mono text-etiqueta uppercase text-accent-olive">
						(02) — Mi Propósito
					</p>

					<TextoEnmascarado>
						<h4
							id="servicios-title"
							className="mt-6 max-w-[20ch] font-heading text-titulo-l font-normal text-fg-on-bone"
						>
							¿Estás listo para cruzar el portal y transmutar tu sombra en{' '}
							<em className="italic text-accent-olive">tu luz</em>?
						</h4>
					</TextoEnmascarado>

					<section
						aria-labelledby="etica-title"
						className="md:ml-auto md:mt-14 md:w-[62%]"
					>
						<TextoEnmascarado>
							<h4
								id="etica-title"
								className="font-heading text-titulo-2xs font-normal text-fg-on-bone-soft"
							>
								No es predicción ni videncia. Lo que ofrezco a través de la
								astrología es un trabajo profundo de introspección:{' '}
								<em className="box-decoration-clone italic bg-surface-wine px-1.5 text-fg-primary">
									un lenguaje para avanzar, sanar y comprender lo invisible.
								</em>{' '}
								En mis servicios uso la astrología y los oráculos como soporte para
								captar el inconsciente, la energía y la configuración espiritual del
								alma.
							</h4>
						</TextoEnmascarado>
					</section>
				</div>
			</section>

			<section
				id="servicios"
				aria-label="Mis servicios"
				className="relative isolate mx-auto w-full max-w-pagina pb-20 pt-20 md:pb-seccion-s md:pt-seccion-s"
			>
				<p className="mb-6 px-6 font-mono text-etiqueta uppercase text-gold md:px-borde">
					(03) — Mis Servicios
				</p>

				{/* Sin envoltorio con padding: la lámina es el fondo del slider y
				    tiene que llegar al borde. El margen lo ponen las piezas de
				    adentro. */}
				<SliderServicios servicios={SERVICIOS} />
			</section>
		</>
	)
}

import { ParallaxPhoto } from '@/components/UI/ParallaxPhoto'
import { Reveal } from '@/components/UI/Reveal'

const PHOTOS = [
	{
		src: '/Elaira.jpeg',
		alt: 'Elaïra leyendo cartas sobre una mesa a la luz de una vela',
		width: 768,
		height: 1376,
		size: 'h-[430px] md:h-[700px]',
	},
	{
		src: '/red_apple.jpeg',
		alt: 'Manos barajando un mazo de tarot de bordes gastados',
		width: 1376,
		height: 768,
		size: 'h-[300px] md:h-[480px]',
	},
	{
		src: '/sun_and_letters.jpeg',
		alt: 'Escritorio con libros de astrología, flores secas y una vela encendida',
		width: 1408,
		height: 768,
		size: 'h-[390px] md:h-[640px]',
	},
	{
		src: '/red_gloves.jpeg',
		alt: 'Carta natal dibujada a mano sobre papel envejecido, con un compás de bronce',
		width: 1408,
		height: 768,
		size: 'h-[320px] md:h-[500px]',
	},
	{
		src: '/Elaira_2.jpeg',
		alt: 'Elaïra junto a una ventana en una habitación en penumbra',
		width: 768,
		height: 1376,
		size: 'h-[440px] md:h-[720px]',
	},
]

const CHAPTERS = [
	{
		label: '01 — EL ORIGEN',
		title: 'Siempre estuvo ahí',
		lead: 'De chica, nunca imaginé que terminaría leyendo las estrellas para vivir. Pero mirando hacia atrás, las señales siempre estuvieron ahí.',
		close: 'Mi casa 10 en Acuario ya sabía lo que mi mente consciente tardaria años en entender - que mi camino no iba a parecerse al de nadie.',
	},
	{
		label: '02 — EL ENCUENTRO',
		title: 'La desconexión',
		lead: 'Antes del 2020, vivía con ansiedad crónica. No sabía por qué sentía todo tan intensamente. Todo me parecía demasiado bello y doloroso a la vez.',
		close: 'Viví con esa tensión durante años, como si algo enorme esperara debajo de la superficie listo para emerger pero sin permiso para hacerlo',
	},
	{
		label: '03 — EL RENACIMIENTO',
		title: 'El despertar espiritual',
		lead: 'En el 2020 todo se quebró. Un amor imposible me desgarró el ego y derrumbó todo lo que creía saber de mi misma. Fue una muerte del ego en tiempo real. Pero de las cenizas emergió algo que no esperaba: un despertar espiritual que desbloqueó dones que no sabía que tenía',
		close: 'Clariaudiencia. Intuición amplificada. Una percepción de la realidad de la que ya no podía volver atrás. No lo elegí, me eligió a mí',
	},
	{
		label: '04 — LA VIDA',
		title: 'Sentir',
		lead: 'Siento todo al cien por ciento. Sin filtro, sin volumen bajo. Puedo sentir un asombro inmenso, una alegría profunda y un amor incondicional. Pero también una tristeza que me atraviesa, miedo o incluso desesperación.',
		close: 'Pero mi hipersensibilidad no es un defecto. Es una forma de estar viva.',
	},
	{
		label: '05 — EL PROPÓSITO',
		title: 'ELAÏRA',
		lead: 'Un día, en clariaudiencia, escuché un nombre: Elaïra. Más tarde descubrí que es una luna que orbita alrededor de Júpiter, el planeta que domina mi carta natal. No fue una coincidencia, fue un reconocimiento.',
		close: 'Elaïra es la firma vibratoria de mi alma. Y hoy, esa firma tiene un propósito: ayudarte a encontrar la tuya.',
		closeHighlighted: true,
	},
]

/**
 * Historia — fotos a la izquierda y capítulos a la derecha en desktop; en
 * mobile, una columna con foto y capítulo alternados.
 *
 * Un solo DOM para las dos disposiciones: las columnas son `display:contents`
 * en mobile —sus hijos pasan a ser items de la grilla— y el intercalado lo
 * resuelve `order`. Tocar cualquiera de los dos rompe el orden en mobile.
 */
export function Historia() {
	return (
		<section
			id="historia"
			aria-labelledby="historia-title"
			className="mx-auto w-full max-w-pagina px-6 pb-28 pt-20 md:px-borde md:pb-seccion md:pt-12"
		>
			<p className="font-mono text-etiqueta uppercase text-gold mb-6">(01) — Mi Historia</p>
			<div className="grid grid-cols-1 gap-y-12 md:grid-cols-[560px_1fr] md:gap-x-24 md:gap-y-0">
				<div className="contents md:flex md:flex-col md:gap-6">
					{PHOTOS.map((photo, i) => (
						<ParallaxPhoto
							key={photo.src}
							src={photo.src}
							alt={photo.alt}
							width={photo.width}
							height={photo.height}
							sizes="(min-width: 768px) 560px, 100vw"
							className={photo.size}
							style={{ order: 1 + i * 2 }}
						/>
					))}
				</div>

				<div className="contents md:flex md:flex-col md:justify-between">
					<Reveal style={{ order: 0 }} className="md:max-w-[540px]">
						<h2
							id="historia-title"
							className="font-heading text-titulo-m font-normal bg-surface-wine text-fg-primary"
						>
							Mi alma
						</h2>
						<p className="mt-5 text-cuerpo-l text-fg-secondary">
							Hace un tiempo, una voz en clariaudiencia me susurró un nombre: Elaïra.
							Más tarde descubrí que este nombre designa a una luna que gravita en una
							órbita sagrada alrededor de Júpiter.
						</p>
					</Reveal>

					{CHAPTERS.map((chapter, i) => (
						<Reveal
							as="article"
							key={chapter.label}
							style={{ order: 2 + i * 2 }}
							className="border-t border-hairline pt-6 md:max-w-[540px] md:pr-8"
						>
							<p className="font-mono text-etiqueta-s uppercase text-gold">
								{chapter.label}
							</p>
							<h3 className="mt-5 font-heading bg-surface-wine text-titulo-xs font-normal text-fg-primary">
								{chapter.title}
							</h3>
							<p className="mt-5 text-cuerpo text-fg-primary">{chapter.lead}</p>
							<p
								className={`mt-5 text-cuerpo ${
									chapter.closeHighlighted
										? 'italic text-gold-bright'
										: 'text-fg-secondary'
								}`}
							>
								{chapter.close}
							</p>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	)
}

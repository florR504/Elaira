import { ParallaxPhoto } from '@/components/UI/ParallaxPhoto'
import { Reveal } from '@/components/UI/Reveal'

const PHOTOS = [
	{
		src: '/Elaira.jpeg',
		alt: 'Elaira leyendo cartas sobre una mesa a la luz de una vela',
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
		alt: 'Elaira junto a una ventana en una habitación en penumbra',
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
		lead: 'Siento todo al cien por ciento. Sin filtro, sin volumen bajo. Puedo sentir un asombro inmenso, una alegría profunda y un amor incondicional. Pero también una tristeza que ma atraviesa, miedo o incluso desesperación.',
		close: 'Pero me hipersensibilidad no es un defecto. Es una forma de estar viva.',
	},
	{
		label: '05 — EL PROPÓSITO',
		title: 'ELAÏRA',
		lead: 'Un día, en clariaudiencia escuché un nombre: Elaïra. Más tarde descubrí que es una luna que orbita alrededor de Júpiter, el planeta que domina mi carta natal. No fue una coincidencia, fue un reconocimiento.',
		close: 'Elaïra es la firma vibratoria de mi alma. Y hoy, esa firma tiene un propósito: ayudarte a encontrar la tuya',
		closeHighlighted: true,
	},
]

/**
 * Historia — dos columnas en desktop: pila de fotos a la izquierda, relato en
 * capítulos a la derecha. En mobile colapsa a una sola columna con foto y
 * capítulo alternados.
 *
 * Es un solo DOM para las dos disposiciones. Los contenedores de cada columna
 * son `display:contents` en mobile —sus hijos pasan a ser items directos de la
 * grilla— y `flex` de md para arriba. El intercalado en mobile lo resuelve
 * `order`, con valores que quedan crecientes dentro de cada columna, así en
 * desktop no hay que resetear nada. La alternativa era renderizar dos veces y
 * duplicar la descarga de las cinco fotos.
 *
 * `justify-between` en la columna de texto reparte los capítulos a lo largo del
 * alto de la columna de fotos. En el diseño de Pencil eso está resuelto con un
 * gap fijo de 268px calculado a mano; acá sale solo y sobrevive a que cambien
 * las alturas de las fotos.
 */
export function Historia() {
	return (
		<section
			id="historia"
			aria-labelledby="historia-title"
			className="mx-auto w-full max-w-[1440px] px-6 py-20 md:px-[60px] md:py-[48px]"
		>
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
							className="font-heading text-[clamp(3.25rem,5.5vw,80px)] font-normal bg-surface-wine leading-none  tracking-[-0.025em] text-fg-primary"
						>
							Mi alma
						</h2>
						<p className="mt-5 text-[16px] leading-[1.6] text-fg-secondary">
							Hace un tiempo, una voz en clariaudiencia me susurro un nombre: ELAIRA.
							Más tarde descubrí que este nombre designa a una luna que gravita en una
							órbita sagrada alrededor de Júpiter
						</p>
					</Reveal>

					{CHAPTERS.map((chapter, i) => (
						<Reveal
							as="article"
							key={chapter.label}
							style={{ order: 2 + i * 2 }}
							className="border-t border-hairline pt-6 md:max-w-[540px] md:pr-8"
						>
							<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
								{chapter.label}
							</p>
							<h3 className="mt-5 font-heading  bg-surface-wine text-[clamp(2rem,2.5vw,36px)] font-normal leading-[1.15] tracking-[-0.02em] text-fg-primary">
								{chapter.title}
							</h3>
							<p className="mt-5 text-[15px] leading-[1.75] text-fg-primary">
								{chapter.lead}
							</p>
							<p
								className={`mt-5 text-[15px] leading-[1.75] ${
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

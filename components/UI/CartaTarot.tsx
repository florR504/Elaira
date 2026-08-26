import Image from 'next/image'

type Props = {
	numeral: string
	/** Tema corto de la pregunta. La pregunta entera va en el panel. */
	tema: string
	/** Agrupador: cuándo aplica esta pregunta. */
	etiqueta: string
	/** Lámina del centro. Una distinta por servicio. */
	imagen: string
	/** Alterna el fondo para dar profundidad al mazo. */
	tono: 'wine' | 'negro'
}

/**
 * Carta de tarot. Proporción 2:3, filete dorado por dentro del borde,
 * numeral romano arriba y una lámina esotérica al centro en mix-blend-screen.
 *
 * Ocupa el 100% de su contenedor: el tamaño lo decide el mazo, que es quien
 * sabe si estamos en mobile o desktop.
 *
 * El padding define a qué distancia del borde queda el filete, y tiene que ser
 * MENOR que el desplazamiento entre cartas del mazo: si no, la franja que
 * asoma de las de atrás no llega a mostrar el dorado.
 */
export function CartaTarot({ numeral, tema, etiqueta, imagen, tono }: Props) {
	return (
		<div
			className={`h-full w-full p-2 md:p-3 ${
				tono === 'wine' ? 'bg-surface-raised' : 'bg-surface-primary'
			}`}
		>
			<div className="flex h-full w-full flex-col items-center justify-between border border-gold px-[18px] py-[22px]">
				<span className="font-display text-[20px] tracking-[0.15em] text-gold-bright">
					{numeral}
				</span>

				<div className="relative w-full flex-1">
					<Image
						src={imagen}
						alt=""
						fill
						sizes="(min-width: 768px) 300px, 260px"
						className="object-contain mix-blend-screen"
					/>
				</div>

				<div className="flex w-full flex-col items-center gap-2.5">
					<span className="h-px w-10 bg-gold" />
					<span className="text-center font-heading text-[22px] leading-[1.15] text-fg-primary">
						{tema}
					</span>
					<span className="font-mono text-[9px] uppercase tracking-[0.18em] text-fg-on-wine-soft">
						{etiqueta}
					</span>
				</div>
			</div>
		</div>
	)
}

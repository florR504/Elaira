'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { CartaTarot } from './CartaTarot'

/** useLayoutEffect avisa en SSR; en el server no hay layout que medir. */
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export type CartaData = {
	numeral: string
	tema: string
	etiqueta: string
	imagen: string
}

/** Desplazamiento entre cartas. Mobile va más cerrado: el abanico de desktop
 *  mide 396px de ancho y no entra en una pantalla de 390.
 *
 *  El valor de `x` tiene que superar el padding de la carta (8px en mobile,
 *  12px en desktop), que es donde vive el filete dorado. Si es menor, la
 *  franja que asoma de las cartas de atrás muestra solo fondo y el mazo pierde
 *  los bordes. La rotación en mobile baja a 0.8° para compensar: cada grado
 *  ensancha la caja de la carta y el abanico se pasaría de los 342px útiles. */
const FAN = {
	wide: { x: 24, y: 24, rot: 2 },
	compact: { x: 14, y: 14, rot: 0.8 },
}

/** Posición de una carta según su lugar en el mazo. 0 es la de adelante. */
function slot(i: number, compact: boolean) {
	const f = compact ? FAN.compact : FAN.wide
	return {
		x: i * f.x,
		y: (4 - i) * f.y,
		rotate: i * f.rot,
		zIndex: 5 - i,
	}
}

type Props = {
	cartas: CartaData[]
	className?: string
	/** Avisa qué carta quedó adelante, para sincronizar la descripción. */
	onCambio?: (indice: number) => void
}

/**
 * Mazo de cartas que se baraja al tocarlo o deslizarlo.
 *
 * El orden vive en un ref y no en estado de React: las posiciones las maneja
 * GSAP con transforms, y un re-render que volviera a escribir esas cartas
 * pelearía con la animación. React solo re-renderiza el contador, que no toca
 * el DOM de las cartas.
 *
 * El mazo es decorativo: va `aria-hidden` y sin foco, porque los cinco
 * servicios están completos en la lista de abajo, que es el contenido real.
 * Así no obligamos a nadie a barajar cinco veces para leer la sección.
 */
export function MazoTarot({ cartas, className = '', onCambio }: Props) {
	const refs = useRef<(HTMLLIElement | null)[]>([])
	/** Índices de carta, de adelante hacia atrás. */
	const orden = useRef<number[]>(cartas.map((_, i) => i))
	const ocupado = useRef(false)
	const compacto = useRef(false)
	const [frente, setFrente] = useState(0)

	const acomodar = useCallback(() => {
		orden.current.forEach((idx, i) => {
			gsap.set(refs.current[idx], { ...slot(i, compacto.current), opacity: 1 })
		})
	}, [])

	useIsoLayoutEffect(() => {
		const mq = window.matchMedia('(max-width: 767px)')
		compacto.current = mq.matches
		acomodar()

		const onChange = () => {
			compacto.current = mq.matches
			acomodar()
		}
		mq.addEventListener('change', onChange)
		return () => mq.removeEventListener('change', onChange)
	}, [acomodar])

	const barajar = useCallback(() => {
		if (ocupado.current) return
		ocupado.current = true

		const [saliente, ...resto] = orden.current
		orden.current = [...resto, saliente]
		setFrente(orden.current[0])
		onCambio?.(orden.current[0])

		const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
		const tl = gsap.timeline({
			onComplete: () => {
				ocupado.current = false
			},
		})

		if (reducido) {
			orden.current.forEach((idx, i) => {
				tl.set(refs.current[idx], { ...slot(i, compacto.current), opacity: 1 }, 0)
			})
			return
		}

		// La de adelante se va hacia abajo a la izquierda, como si la repartieran.
		tl.to(
			refs.current[saliente],
			{
				xPercent: -18,
				yPercent: 10,
				rotate: -7,
				opacity: 0,
				duration: 0.35,
				ease: 'power2.in',
			},
			0
		)

		// Las que quedan avanzan un lugar.
		resto.forEach((idx, i) => {
			tl.to(
				refs.current[idx],
				{ ...slot(i, compacto.current), duration: 0.5, ease: 'sine.inOut' },
				0
			)
		})

		// Y la que salió reaparece al fondo del mazo.
		tl.set(refs.current[saliente], {
			...slot(4, compacto.current),
			xPercent: 0,
			yPercent: 0,
			opacity: 0,
		}).to(refs.current[saliente], {
			opacity: 1,
			duration: 0.3,
			ease: 'power2.out',
		})
	}, [onCambio])

	// Tap o swipe hacia la izquierda. Un swipe a la derecha se ignora para no
	// interferir con el gesto de "atrás" del navegador.
	const inicio = useRef(0)
	const onPointerDown = (e: React.PointerEvent) => {
		inicio.current = e.clientX
	}
	const onPointerUp = (e: React.PointerEvent) => {
		const dx = e.clientX - inicio.current
		if (dx < -40 || Math.abs(dx) < 10) barajar()
	}

	return (
		<div
			aria-hidden
			onPointerDown={onPointerDown}
			onPointerUp={onPointerUp}
			// El contenedor va más ancho que el abanico: las cartas rotadas crecen
			// unos 30px sobre su caja y sin ese margen se comen el padding lateral.
			className={`relative h-[456px] w-[338px] cursor-pointer touch-pan-y select-none md:h-[556px] md:w-[430px] ${className}`}
		>
			<ul className="absolute inset-0 list-none">
				{cartas.map((carta, i) => (
					<li
						key={carta.numeral}
						ref={(el) => {
							refs.current[i] = el
						}}
						className="absolute left-0 top-0 h-[390px] w-[260px] will-change-transform md:h-[450px] md:w-[300px]"
					>
						<CartaTarot
							numeral={carta.numeral}
							tema={carta.tema}
							etiqueta={carta.etiqueta}
							imagen={carta.imagen}
							tono={i % 2 === 0 ? 'wine' : 'negro'}
						/>
					</li>
				))}
			</ul>

			<div className="absolute -bottom-8 left-0 flex w-full items-center justify-between">
				<span className="font-mono text-etiqueta text-gold-bright">
					{cartas[frente]?.numeral} / {cartas[cartas.length - 1]?.numeral}
				</span>
				<span className="font-mono text-etiqueta-s text-fg-muted">TOCÁ PARA BARAJAR</span>
			</div>
		</div>
	)
}

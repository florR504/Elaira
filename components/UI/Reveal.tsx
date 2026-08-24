'use client'

import {
	useEffect,
	useLayoutEffect,
	useRef,
	type CSSProperties,
	type ReactNode,
	type RefObject,
} from 'react'
import gsap from 'gsap'

/** useLayoutEffect avisa en SSR; en el server no hay layout que medir. */
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

type Props = {
	children: ReactNode
	className?: string
	style?: CSSProperties
	/** Etiqueta a renderizar. Por defecto div. */
	as?: 'div' | 'article'
	/** Retraso entre hijo e hijo, en segundos. */
	stagger?: number
}

/**
 * Entrada escalonada de los hijos directos: suben 24px con fade, uno atrás del
 * otro. Se dispara una sola vez cuando el bloque entra en pantalla.
 *
 * Solo mobile — de md para arriba las secciones ya tienen su propio lenguaje
 * (el parallax de las fotos) y sumar entradas ahí sería ruido.
 *
 * Usa IntersectionObserver y no ScrollTrigger a propósito. ScrollTrigger
 * cachea la posición del elemento cuando se crea el trigger, y en esta página
 * el pin del hero agrega ~240vh de spacer *después* de que estos componentes
 * montaron: las posiciones quedaban corridas y los tweens se daban por
 * cumplidos sin llegar a verse. IntersectionObserver no depende de esa
 * aritmética.
 *
 * Solo se oculta el contenido si efectivamente vamos a animarlo: en desktop o
 * con movimiento reducido salimos antes de tocar nada, así nunca queda algo
 * invisible esperando un observer que no va a llegar.
 */
export function Reveal({
	children,
	className,
	style,
	as: Tag = 'div',
	stagger = 0.08,
}: Props) {
	const ref = useRef<HTMLElement>(null)

	useIsoLayoutEffect(() => {
		const el = ref.current
		if (!el) return

		const isMobile = window.matchMedia('(max-width: 767px)').matches
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
		if (!isMobile || reduced) return

		const items = Array.from(el.children)
		if (!items.length) return

		gsap.set(items, { y: 24, opacity: 0 })

		const io = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return
				io.disconnect()
				gsap.to(items, {
					y: 0,
					opacity: 1,
					duration: 0.7,
					ease: 'power2.out',
					stagger,
				})
			},
			{ threshold: 0.15 }
		)
		io.observe(el)

		return () => {
			io.disconnect()
			gsap.killTweensOf(items)
			gsap.set(items, { clearProps: 'transform,opacity' })
		}
	}, [stagger])

	return (
		<Tag ref={ref as RefObject<HTMLDivElement>} className={className} style={style}>
			{children}
		</Tag>
	)
}

'use client'

import Image from 'next/image'
import { useEffect, useLayoutEffect, useRef, type CSSProperties } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** useLayoutEffect avisa en SSR; en el server no hay layout que medir. */
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * Sobremedida de la imagen respecto de su ventana: el margen que tiene para
 * desplazarse. 30% es el mismo orden que usa conqr.mx — foto de 900px dentro
 * de una ventana de 675.
 */
const OVERSCAN = 0.3

/**
 * La imagen arranca centrada (top -15%) y recorre la mitad de la sobremedida
 * hacia cada lado. Como yPercent es relativo al alto de la propia imagen, hay
 * que dividir por (1 + OVERSCAN) para que el recorrido en píxeles sea
 * exactamente la mitad del sobrante y la ventana nunca quede descubierta.
 */
const TRAVEL = (OVERSCAN / 2 / (1 + OVERSCAN)) * 100

type Props = {
	src: string
	alt: string
	width: number
	height: number
	/** Clases de la ventana: es la que define el alto visible del recorte. */
	className?: string
	/** Para el `order` del intercalado en mobile, que es un valor calculado. */
	style?: CSSProperties
	sizes?: string
	priority?: boolean
}

/**
 * Foto con parallax de revelado. La ventana recorta; la imagen, más alta que
 * la ventana, se desplaza dentro mientras el bloque cruza el viewport.
 *
 * Solo desktop: en mobile el recorrido de scroll es tan corto que el
 * desplazamiento se lee como un salto, no como parallax.
 *
 * En reposo la imagen queda centrada, así que sin JS o con movimiento
 * reducido se ve un encuadre correcto, solo que quieto.
 */
export function ParallaxPhoto({
	src,
	alt,
	width,
	height,
	className = '',
	style,
	sizes,
	priority,
}: Props) {
	const win = useRef<HTMLDivElement>(null)
	const img = useRef<HTMLImageElement>(null)

	useIsoLayoutEffect(() => {
		const mm = gsap.matchMedia()

		mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
			gsap.fromTo(
				img.current,
				{ yPercent: -TRAVEL },
				{
					yPercent: TRAVEL,
					ease: 'none',
					scrollTrigger: {
						trigger: win.current,
						start: 'top bottom',
						end: 'bottom top',
						scrub: true,
					},
				}
			)
		})

		// En mobile el parallax no sirve: el recorrido de scroll de cada foto es
		// muy corto y, con scroll táctil e inercia, todo lo atado a `scrub` llega
		// a saltos. Va un revelado que se dispara una sola vez al entrar.
		mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
			const tl = gsap.timeline({
				scrollTrigger: { trigger: win.current, start: 'top 85%', once: true },
			})

			// fromTo y no from: el estado en reposo del clip-path es `none`, y GSAP
			// no puede interpolar desde un inset() hacia `none`.
			tl.fromTo(
				win.current,
				{ clipPath: 'inset(100% 0% 0% 0%)' },
				{ clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power3.out' },
				0
			).fromTo(
				img.current,
				{ scale: 1.06 },
				{ scale: 1, duration: 1.2, ease: 'power2.out' },
				0
			)
		})

		return () => mm.revert()
	}, [])

	return (
		<div ref={win} style={style} className={`relative overflow-hidden ${className}`}>
			<Image
				ref={img}
				src={src}
				alt={alt}
				width={width}
				height={height}
				sizes={sizes}
				priority={priority}
				className="absolute inset-x-0 top-[-15%] h-[130%] w-full object-cover"
			/>
		</div>
	)
}

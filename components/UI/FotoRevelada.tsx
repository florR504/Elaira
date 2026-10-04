'use client'

import Image from 'next/image'
import { useEffect, useLayoutEffect, useRef, type CSSProperties } from 'react'
import gsap from 'gsap'

/** useLayoutEffect avisa en SSR; en el server no hay layout que medir. */
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

type Props = {
	src: string
	alt: string
	/** Clases de la ventana: es la que define el recorte visible. */
	className?: string
	/** Para la máscara de bordes, que se pasa desde afuera. */
	style?: CSSProperties
	sizes?: string
}

/**
 * Foto que se revela al entrar en pantalla: un barrido de abajo hacia arriba y
 * la imagen asentándose de un leve zoom a su tamaño real.
 *
 * Es el mismo lenguaje que el revelado mobile de `ParallaxPhoto`, a propósito:
 * la página ya tiene esa entrada para fotos y no hacía falta inventar otra.
 * Lo que no trae es el parallax, que en esta sección se descartó porque era
 * justo lo que la emparentaba con Historia.
 *
 * El barrido va por `clip-path` y no por la máscara de bordes: la máscara es de
 * la ventana y la escribe quien la usa, así que animarla sería pisarle el
 * degradado. Las dos conviven —el clip recorta la capa de adentro y la máscara
 * desvanece los bordes de la ventana— y la foto aparece con el borde ya
 * difuminado en vez de con un canto duro.
 *
 * Se dispara con IntersectionObserver y no con ScrollTrigger, por lo mismo que
 * `Reveal` y `TextoEnmascarado`: el pin del hero agrega ~240vh de spacer
 * después de que estos componentes montaron y las posiciones cacheadas quedan
 * corridas.
 */
export function FotoRevelada({ src, alt, className = '', style, sizes }: Props) {
	const ventana = useRef<HTMLDivElement>(null)
	const recorte = useRef<HTMLDivElement>(null)
	const img = useRef<HTMLImageElement>(null)

	useIsoLayoutEffect(() => {
		const ventanaEl = ventana.current
		const recorteEl = recorte.current
		const imgEl = img.current
		if (!ventanaEl || !recorteEl || !imgEl) return
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

		// El clip va en la capa de adentro y el observer mira la de afuera.
		// Chromium cuenta el clip-path al calcular la intersección: con el
		// recorte en el mismo elemento observado, la ventana reportaba ratio 0
		// y el revelado no se disparaba nunca.
		gsap.set(recorteEl, { clipPath: 'inset(100% 0% 0% 0%)' })
		gsap.set(imgEl, { scale: 1.08 })

		const io = new IntersectionObserver(
			([entrada]) => {
				if (!entrada.isIntersecting) return
				io.disconnect()

				gsap.timeline()
					.to(recorteEl, {
						clipPath: 'inset(0% 0% 0% 0%)',
						duration: 1,
						ease: 'power3.out',
					})
					// La escala tarda más que el barrido y sigue cediendo después de
					// que la foto ya se ve entera: es lo que la hace respirar en vez
					// de frenar en seco.
					.to(imgEl, { scale: 1, duration: 1.6, ease: 'power2.out' }, 0)
			},
			{ threshold: 0.2 }
		)
		io.observe(ventanaEl)

		return () => {
			io.disconnect()
			gsap.killTweensOf([recorteEl, imgEl])
			gsap.set(recorteEl, { clearProps: 'clipPath' })
			gsap.set(imgEl, { clearProps: 'transform' })
		}
	}, [])

	return (
		<div ref={ventana} style={style} className={className}>
			<div ref={recorte} className="absolute inset-0">
				<Image ref={img} src={src} alt={alt} fill sizes={sizes} className="object-cover" />
			</div>
		</div>
	)
}

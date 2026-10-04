'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'

/** useLayoutEffect avisa en SSR; en el server no hay layout que medir. */
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/** Cada cuánto pasa solo al siguiente. Más largo que el de servicios: acá hay
 *  que leer una cita entera, no un nombre y un precio. */
const INTERVALO = 7000

export type Testimonio = {
	id: string
	cita: string
	nombre: string
	servicio: string
	lugar: string
}

type Props = { testimonios: Testimonio[] }

/**
 * Slider de testimonios: una cita por vez, cruzando con fade.
 *
 * Mismo mecanismo que `SliderServicios` —slides apilados en una sola celda de
 * grilla y el estado derivado siempre de `activo`, sin memoria de cuál venía
 * antes— porque ahí ya se resolvió el caso feo: si un cambio llega antes de
 * que termine el anterior (el autoplay pisando un click), animar solo el par
 * sale/entra deja dos slides visibles a la vez.
 *
 * La altura la fija el testimonio más largo, no el activo: se rendersizan
 * todos apilados y el más alto empuja la caja. Sin eso, la sección salta de
 * alto en cada cambio y arrastra a la página entera.
 *
 * Sin controles a la vista: las citas se leen de corrido, una atrás de la otra,
 * y nadie viene a esta sección a elegir testimonio. La navegación a mano sigue
 * estando —swipe, flechas del teclado— y el hover frena el reloj, así que una
 * cita que estás leyendo no se va sola.
 */
export function SliderTestimonios({ testimonios }: Props) {
	const [activo, setActivo] = useState(0)
	const [pausado, setPausado] = useState(false)
	const [fueraDeVista, setFueraDeVista] = useState(false)
	const [reducido, setReducido] = useState(true)

	const raiz = useRef<HTMLDivElement>(null)
	const pista = useRef<HTMLUListElement>(null)
	const total = testimonios.length

	const irA = useCallback((i: number) => setActivo(((i % total) + total) % total), [total])

	useIsoLayoutEffect(() => {
		setReducido(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
	}, [])

	// Estado inicial por gsap.set y no por clases: las animaciones escriben
	// opacity inline y le ganarían siempre a una clase.
	useIsoLayoutEffect(() => {
		const slides = pista.current ? Array.from(pista.current.children) : []
		gsap.set(slides, { opacity: 0 })
		if (slides[0]) gsap.set(slides[0], { opacity: 1, y: 0 })
	}, [])

	useIsoLayoutEffect(() => {
		const slides = pista.current ? Array.from(pista.current.children) : []
		const entra = slides[activo]
		if (!entra) return

		const otros = slides.filter((_, i) => i !== activo)

		if (reducido) {
			gsap.set(otros, { opacity: 0 })
			gsap.set(entra, { opacity: 1, y: 0 })
			return
		}

		// Sube al entrar en vez de cruzar de costado como los servicios: una
		// cita se lee de arriba abajo y el movimiento vertical acompaña esa
		// lectura. `overwrite` cancela cualquier tween previo sobre el mismo
		// elemento.
		gsap.to(otros, { opacity: 0, y: -24, duration: 0.45, ease: 'power2.in', overwrite: 'auto' })
		gsap.fromTo(
			entra,
			{ opacity: 0, y: 24 },
			{ opacity: 1, y: 0, duration: 0.75, ease: 'power3.out', overwrite: 'auto' }
		)
	}, [activo, reducido])

	// No corre el reloj si la sección no está en pantalla.
	useEffect(() => {
		const el = raiz.current
		if (!el) return
		const io = new IntersectionObserver(([e]) => setFueraDeVista(!e.isIntersecting), {
			threshold: 0.2,
		})
		io.observe(el)
		return () => io.disconnect()
	}, [])

	// Depende de `activo`, así que se reinicia solo: si navegás a mano, el
	// próximo salto vuelve a contar desde cero.
	useEffect(() => {
		if (reducido || pausado || fueraDeVista) return
		const id = setTimeout(() => setActivo((a) => (a + 1) % total), INTERVALO)
		return () => clearTimeout(id)
	}, [activo, pausado, fueraDeVista, reducido, total])

	const onKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowRight') irA(activo + 1)
		if (e.key === 'ArrowLeft') irA(activo - 1)
	}

	const inicio = useRef(0)
	const onPointerDown = (e: React.PointerEvent) => {
		inicio.current = e.clientX
	}
	const onPointerUp = (e: React.PointerEvent) => {
		const dx = e.clientX - inicio.current
		if (Math.abs(dx) < 45) return
		irA(activo + (dx < 0 ? 1 : -1))
	}

	return (
		<div
			ref={raiz}
			role="group"
			aria-roledescription="carrusel"
			aria-label="Testimonios"
			onKeyDown={onKeyDown}
			onMouseEnter={() => setPausado(true)}
			onMouseLeave={() => setPausado(false)}
			onFocusCapture={() => setPausado(true)}
			onBlurCapture={() => setPausado(false)}
			onPointerDown={onPointerDown}
			onPointerUp={onPointerUp}
			className="mt-14 md:mt-20"
		>
			<ul ref={pista} className="grid list-none">
				{testimonios.map((t, i) => (
					<li
						key={t.id}
						onFocus={() => i !== activo && irA(i)}
						className={`col-start-1 row-start-1 will-change-transform ${
							i === activo ? '' : 'pointer-events-none'
						}`}
					>
						{/* La comilla es decorativa y va fuera del texto: adentro, un
						    lector de pantalla la leería como parte de la cita. */}
						<blockquote>
							<p
								aria-hidden
								className="font-heading text-[64px] leading-[0.6] text-accent-olive"
							>
								&ldquo;
							</p>
							<p className="mt-4 max-w-[22ch] text-fg-secondary font-heading text-titulo-xs font-normal leading-[1.25] md:max-w-[26ch]">
								{t.cita}
							</p>
							<footer className="mt-10 flex flex-col gap-1">
								<cite className="font-mono text-[12px] uppercase not-italic tracking-[0.18em] text-accent-olive">
									{t.nombre}
								</cite>
								<p className="text-[15px] leading-[1.6] text-fg-on-bone-soft">
									{t.servicio}
									<span className="px-2" aria-hidden>
										·
									</span>
									{t.lugar}
								</p>
							</footer>
						</blockquote>
					</li>
				))}
			</ul>
		</div>
	)
}

'use client'

import Image from 'next/image'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'

/** useLayoutEffect avisa en SSR; en el server no hay layout que medir. */
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/** Cada cuánto avanza solo. */
const INTERVALO = 8000

export type Servicio = {
	numero: string
	nombre: string
	imagen: string
	ancho: number
	alto: number
	alt: string
	descripcion: string
	incluye: string
	duracion: string
	precio: string
	cta: string
}

type Props = { servicios: Servicio[] }

/**
 * Slider de servicios: la lámina es el fondo de la sección, no un elemento al
 * lado del texto. Al cambiar de servicio cruza con fade.
 *
 * La capa de fondo va `absolute inset-0` y se apoya en que la `<section>` es el
 * único ancestro posicionado: cubre la sección entera, título incluido. Va
 * en `-z-10` y después del cielo en el DOM, así queda por encima de las
 * estrellas pero por debajo de todo el contenido.
 *
 * Encima lleva un velo oscuro, sin el cual el texto no se lee sobre láminas que
 * tienen zonas claras. En desktop es un degradado hacia la derecha: tapa donde
 * está el texto y deja respirar la lámina del otro lado. En mobile el texto
 * ocupa todo el ancho, así que ahí va un velo parejo.
 *
 * Los slides son solo texto y van apilados en la misma celda de grilla: el loop
 * es `(i + 1) % total`, sin clones ni saltos. Los inactivos quedan en opacidad
 * 0 pero legibles para lectores de pantalla.
 */
export function SliderServicios({ servicios }: Props) {
	const [activo, setActivo] = useState(0)
	const [pausado, setPausado] = useState(false)
	const [fueraDeVista, setFueraDeVista] = useState(false)
	const [reducido, setReducido] = useState(true)

	const raiz = useRef<HTMLDivElement>(null)
	const pista = useRef<HTMLUListElement>(null)
	const fondos = useRef<(HTMLDivElement | null)[]>([])
	const total = servicios.length

	const irA = useCallback((i: number) => setActivo(((i % total) + total) % total), [total])

	useIsoLayoutEffect(() => {
		setReducido(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
	}, [])

	// Estado inicial: solo el primero visible. Va por gsap.set y no por clases
	// porque después las animaciones escriben opacity inline y ganarían siempre.
	useIsoLayoutEffect(() => {
		const slides = pista.current ? Array.from(pista.current.children) : []
		gsap.set([...slides, ...fondos.current.filter(Boolean)], { opacity: 0 })
		if (slides[0]) gsap.set(slides[0], { opacity: 1, x: 0 })
		if (fondos.current[0]) gsap.set(fondos.current[0], { opacity: 1 })
	}, [])

	// Cruce del texto y del fondo.
	//
	// Se recalculan TODOS los slides en cada cambio en vez de animar solo el que
	// sale y el que entra. Con el par sale/entra, si un cambio llegaba antes de
	// que terminara el anterior —autoplay pisando un click— los tweens se
	// superponían y quedaban dos slides visibles a la vez. Así el estado se
	// deriva siempre de `activo`, sin memoria de qué venía antes, y `overwrite`
	// cancela cualquier tween previo sobre el mismo elemento.
	useIsoLayoutEffect(() => {
		const slides = pista.current ? Array.from(pista.current.children) : []
		const entra = slides[activo]
		const fEntra = fondos.current[activo]
		if (!entra) return

		const otros = slides.filter((_, i) => i !== activo)
		const otrosFondos = fondos.current.filter((f, i) => f && i !== activo)

		if (reducido) {
			gsap.set(otros, { opacity: 0 })
			gsap.set(otrosFondos, { opacity: 0 })
			gsap.set(entra, { opacity: 1, x: 0 })
			gsap.set(fEntra, { opacity: 1 })
			return
		}

		gsap.to(otros, { opacity: 0, x: -40, duration: 0.5, ease: 'power2.in', overwrite: 'auto' })
		gsap.fromTo(
			entra,
			{ opacity: 0, x: 40 },
			{ opacity: 1, x: 0, duration: 0.7, ease: 'power3.out', overwrite: 'auto' }
		)

		// El fondo cruza más lento y sin desplazamiento: es una imagen grande, y
		// moverla al ritmo del texto se siente brusco.
		gsap.to(otrosFondos, { opacity: 0, duration: 1.1, ease: 'power2.inOut', overwrite: 'auto' })
		gsap.to(fEntra, { opacity: 1, duration: 1.1, ease: 'power2.inOut', overwrite: 'auto' })
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
	// próximo salto vuelve a contar los ocho segundos desde cero.
	//
	// El hover no lo frena: la lámina ocupa el ancho de la sección, así que en
	// desktop el cursor está encima casi todo el tiempo y el slider quedaba
	// detenido de hecho. Sí lo frena el foco, que es cuando alguien está
	// recorriendo los servicios con el teclado y cambiarle el slide abajo de la
	// mano lo perdería.
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
			aria-label="Servicios"
			onKeyDown={onKeyDown}
			onFocusCapture={() => setPausado(true)}
			onBlurCapture={() => setPausado(false)}
			className="mt-14 md:mt-20"
		>
			<ul className="mx-6 mb-10 hidden list-none flex-wrap justify-center gap-x-8 gap-y-3 border-b border-hairline pb-6 md:mx-margen md:flex">
				{servicios.map((s, i) => (
					<li key={s.numero}>
						<button
							type="button"
							onClick={() => irA(i)}
							aria-current={i === activo}
							className={`font-mono text-etiqueta uppercase transition-colors ${
								i === activo
									? 'text-gold-bright'
									: 'text-fg-muted hover:text-fg-secondary'
							}`}
						>
							{s.numero} {s.nombre}
						</button>
					</li>
				))}
			</ul>

			{/* El fondo se ancla acá y no en la sección: tiene que cubrir el
				    slide, no el título de la sección. `isolate` acota el -z-10 a
				    esta caja, así la lámina queda sobre el cielo y bajo el texto. */}
			<div
				onPointerDown={onPointerDown}
				onPointerUp={onPointerUp}
				className="relative isolate py-12 md:py-16"
			>
				<div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
					{servicios.map((s, i) => (
						<div
							key={s.numero}
							ref={(el) => {
								fondos.current[i] = el
							}}
							className="mascara-lamina absolute inset-0 opacity-0"
						>
							{/* En mobile la caja es más alta que ancha, así que con
							    `cover` manda el alto: pidiendo 100vw el navegador baja
							    una imagen de 390px y después la estira para tapar 514 de
							    alto. 140vw le hace pedir el escalón siguiente y la lámina
							    —que es todo línea fina— deja de verse blanda. */}
							<Image
								src={s.imagen}
								alt=""
								fill
								sizes="(min-width: 768px) 100vw, 140vw"
								className="object-cover"
							/>
						</div>
					))}

					{/* En mobile el texto ocupa casi toda la caja, así que el velo no
						    puede abrirse hacia abajo: antes bajaba al 25% justo donde caen
						    el precio y el CTA, y la rueda del zodíaco les pasaba por
						    encima. Ahora afloja poco —del 92 al 78— y la lámina se sigue
						    leyendo detrás sin disputarle el texto. */}
					<div className="absolute inset-0 bg-gradient-to-b from-surface-primary/92 via-surface-primary/86 to-surface-primary/78 md:hidden" />
					{/* En desktop el texto va centrado, así que el velo tiene que proteger
						    el centro y no un costado: radial, oscuro en el medio y más
						    claro hacia los bordes para que la lámina respire. */}
					<div className="velo-lamina absolute inset-0 hidden md:block" />
				</div>

				<ul ref={pista} className="grid list-none px-6 md:min-h-[420px] md:px-margen">
					{servicios.map((s, i) => (
						<li
							key={s.numero}
							onFocus={() => i !== activo && irA(i)}
							className={`col-start-1 row-start-1 flex flex-col gap-6 will-change-transform md:items-center md:justify-center md:text-center ${
								i === activo ? '' : 'pointer-events-none'
							}`}
						>
							<p className="font-mono text-etiqueta text-gold">{s.numero}</p>

							<h3 className="font-heading text-titulo-m font-normal text-fg-primary">
								{s.nombre}
							</h3>

							<p className="max-w-[480px] text-cuerpo text-fg-primary md:text-cuerpo-l">
								{s.descripcion}
							</p>

							<p className="font-mono text-etiqueta uppercase text-fg-primary">
								{s.incluye}
							</p>

							<p className="font-mono text-cuerpo-s text-fg-secondary">
								{s.duracion}
								<span className="px-3 text-fg-muted">·</span>
								<span className="text-gold-bright">{s.precio}</span>
							</p>

							<a
								href="#contacto"
								className="mt-1 flex w-fit items-center gap-2.5 border-b border-gold pb-3 font-mono text-etiqueta uppercase text-gold-bright transition-colors hover:text-gold"
							>
								{s.cta}
								<span aria-hidden>↗</span>
							</a>
						</li>
					))}
				</ul>
			</div>

			{/* Solo el contador: sin flechas y sin la línea que las sostenía. Para
			    saltar de servicio están las pestañas de arriba, que además dicen a
			    dónde se va en vez de solo "el siguiente". */}
			<div className="mt-10 flex items-center px-6 md:justify-center md:px-margen">
				<p className="font-mono text-etiqueta-l text-fg-muted">
					<span className="text-gold-bright">{servicios[activo].numero}</span> /{' '}
					{servicios[total - 1].numero}
				</p>
			</div>
		</div>
	)
}

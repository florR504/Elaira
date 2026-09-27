'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'

/** Cada cuánto pasa de página solo. Largo: son tres citas para leer, no una. */
const INTERVALO = 9000

export type Testimonio = {
	id: string
	cita: string
	nombre: string
	servicio: string
	lugar: string
}

type Props = { testimonios: Testimonio[] }

/**
 * Carrusel de testimonios por páginas: se ven tres a la vez y el siguiente
 * paso trae otros tres.
 *
 * La pista es un contenedor con scroll horizontal y `scroll-snap`, no una
 * grilla movida con transform. Es lo que hace que el swipe del celular, la
 * rueda horizontal del trackpad y el scroll por teclado funcionen sin que haya
 * que implementarlos: el navegador ya los trae, y encima frena en el lugar
 * justo. Lo único que agrega el JS es el autoplay y los puntos.
 *
 * Cuántos entran por página lo decide el CSS —uno en mobile, dos en tablet,
 * tres en desktop— y el JS lo *mide* en vez de repetir los breakpoints. Así
 * hay una sola fuente de verdad: si mañana cambia el `lg:basis-1/3`, la
 * cantidad de puntos se acomoda sola.
 *
 * Los puntos vuelven acá, a diferencia de los otros sliders del sitio, porque
 * este no avanza de a uno: con dos páginas y sin ninguna marca, la segunda
 * tanda de testimonios no existe para quien no arrastre por curiosidad.
 */
/**
 * Sigue `prefers-reduced-motion` sin un efecto de por medio: es estado que vive
 * afuera de React, así que se lee con `useSyncExternalStore`. En el server no
 * hay media query, y el snapshot de server devuelve `true` —o sea, sin
 * movimiento— para que el primer HTML nunca prometa una animación.
 *
 * El nombre arranca en inglés como `useIsoLayoutEffect`: la regla de hooks de
 * React exige el prefijo `use`, no acepta `usar`.
 */
function useMovimientoReducido() {
	return useSyncExternalStore(
		(avisar) => {
			const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
			mq.addEventListener('change', avisar)
			return () => mq.removeEventListener('change', avisar)
		},
		() => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
		() => true
	)
}

export function CarruselTestimonios({ testimonios }: Props) {
	const pista = useRef<HTMLUListElement>(null)
	const [porPagina, setPorPagina] = useState(1)
	const [pagina, setPagina] = useState(0)
	const [pausado, setPausado] = useState(false)
	const [fueraDeVista, setFueraDeVista] = useState(false)
	const reducido = useMovimientoReducido()

	const paginas = Math.max(1, Math.ceil(testimonios.length / porPagina))

	// Cuántas tarjetas entran, medido sobre el ancho real de la primera.
	useEffect(() => {
		const el = pista.current
		if (!el) return
		const medir = () => {
			const primera = el.firstElementChild as HTMLElement | null
			if (!primera) return
			const ancho = primera.getBoundingClientRect().width
			if (!ancho) return
			setPorPagina(Math.max(1, Math.round(el.clientWidth / ancho)))
		}
		medir()
		const ro = new ResizeObserver(medir)
		ro.observe(el)
		return () => ro.disconnect()
	}, [])

	// La página activa sale del scroll y no de un estado propio: si alguien
	// arrastra a mano, los puntos tienen que seguirlo igual.
	useEffect(() => {
		const el = pista.current
		if (!el) return
		const alScrollear = () => {
			const paso = el.clientWidth
			if (!paso) return
			setPagina(Math.min(paginas - 1, Math.round(el.scrollLeft / paso)))
		}
		el.addEventListener('scroll', alScrollear, { passive: true })
		return () => el.removeEventListener('scroll', alScrollear)
	}, [paginas])

	// No corre el reloj si la sección no está en pantalla.
	useEffect(() => {
		const el = pista.current
		if (!el) return
		const io = new IntersectionObserver(([e]) => setFueraDeVista(!e.isIntersecting), {
			threshold: 0.2,
		})
		io.observe(el)
		return () => io.disconnect()
	}, [])

	const irA = useCallback(
		(i: number) => {
			const el = pista.current
			if (!el) return
			el.scrollTo({
				left: (((i % paginas) + paginas) % paginas) * el.clientWidth,
				behavior: reducido ? 'auto' : 'smooth',
			})
		},
		[paginas, reducido]
	)

	// Depende de `pagina`, así que se reinicia solo: si navegás a mano, el
	// próximo salto vuelve a contar desde cero.
	useEffect(() => {
		if (reducido || pausado || fueraDeVista || paginas < 2) return
		const id = setTimeout(() => irA(pagina + 1), INTERVALO)
		return () => clearTimeout(id)
	}, [pagina, pausado, fueraDeVista, reducido, paginas, irA])

	return (
		<div
			role="group"
			aria-roledescription="carrusel"
			aria-label="Testimonios"
			onMouseEnter={() => setPausado(true)}
			onMouseLeave={() => setPausado(false)}
			onFocusCapture={() => setPausado(true)}
			onBlurCapture={() => setPausado(false)}
			className="mt-16 md:mt-24"
		>
			{/* Los márgenes negativos y el padding de los hijos hacen de `gap`:
			    un `gap` de verdad rompería la cuenta de `clientWidth / ancho`,
			    porque el ancho de la página dejaría de ser múltiplo del de la
			    tarjeta. */}
			<ul
				ref={pista}
				className="-mx-3 flex list-none snap-x snap-mandatory overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
			>
				{testimonios.map((t) => (
					<li key={t.id} className="w-full shrink-0 snap-start px-3 md:w-1/2 lg:w-1/3">
						<div className="h-full border-t border-hairline-bone pt-8">
							{/* La comilla es decorativa y va fuera del texto: adentro, un
							    lector de pantalla la leería como parte de la cita. */}
							<blockquote>
								<p
									aria-hidden
									className="font-heading text-titulo-xs leading-none text-accent-olive"
								>
									&ldquo;
								</p>
								<p className="mt-5 font-heading text-titulo-2xs font-normal text-fg-on-bone">
									{t.cita}
								</p>
								<footer className="mt-7 flex flex-col gap-1">
									<cite className="font-mono text-etiqueta uppercase not-italic text-accent-olive">
										{t.nombre}
									</cite>
									<p className="font-mono text-etiqueta uppercase text-fg-on-bone-soft">
										{t.servicio}
										<span className="px-2" aria-hidden>
											·
										</span>
										{t.lugar}
									</p>
								</footer>
							</blockquote>
						</div>
					</li>
				))}
			</ul>

			{paginas > 1 && (
				<div className="mt-14 flex items-center gap-3">
					{Array.from({ length: paginas }, (_, i) => (
						<button
							key={i}
							type="button"
							onClick={() => irA(i)}
							aria-label={`Ver testimonios ${i * porPagina + 1} a ${Math.min(
								(i + 1) * porPagina,
								testimonios.length
							)}`}
							aria-current={i === pagina}
							className={`h-[3px] w-10 transition-colors ${
								i === pagina ? 'bg-accent-olive' : 'bg-hairline-bone'
							}`}
						/>
					))}
				</div>
			)}
		</div>
	)
}

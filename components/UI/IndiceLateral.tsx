'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Las secciones numeradas de la página. Los números son los mismos que ya
 * muestran los eyebrows: el índice no inventa una nomenclatura nueva, activa
 * la que la página venía usando sin que se pudiera clickear.
 *
 * El hero y el manifiesto quedan afuera a propósito: no están numerados porque
 * no son secciones del índice, son la apertura.
 */
const SECCIONES = [
	{ id: 'historia', numero: '01', nombre: 'Mi historia' },
	{ id: 'proposito', numero: '02', nombre: 'Mi propósito' },
	{ id: 'servicios', numero: '03', nombre: 'Mis servicios' },
	{ id: 'testimonios', numero: '04', nombre: 'Testimonios' },
	{ id: 'sabias-que', numero: '05', nombre: 'Sabías que' },
	{ id: 'preguntas', numero: '06', nombre: 'Preguntas frecuentes' },
	{ id: 'contacto', numero: '07', nombre: 'Contacto' },
]

/**
 * Índice de secciones: riel fijo al borde derecho en desktop, y en mobile un
 * botón que abre el índice a pantalla completa.
 *
 * Resuelve dos cosas a la vez en una página de trece pantallas: llegar a una
 * sección sin recorrerlas todas, y saber cuánto falta — hasta ahora se
 * scrolleaba sin ninguna señal de posición.
 *
 * Va en `mix-blend-difference` para cruzar los dos bloques claros —propósito y
 * testimonios— sin tener que detectar sobre qué fondo está: el modo de fusión
 * lo invierte solo. Por eso el color es `fg-primary` y no un gris: la
 * diferencia contra el hueso da un azul oscuro que se lee, y contra el negro
 * devuelve el crema original.
 *
 * Aparece recién pasado el hero: hasta que una sección numerada no cruza el
 * medio de la pantalla no hay nada que marcar. Ahí el wordmark se abre letra
 * por letra y ocupa todo; cualquier cosa encima le compite.
 */
export function IndiceLateral() {
	const [activa, setActiva] = useState<string | null>(null)

	// El índice existe desde que hay una sección numerada en pantalla, y de ahí
	// en más no se va. Durante el hero no hay ninguna, que es justo lo que se
	// busca: ahí el wordmark se abre letra por letra y ocupa todo.
	//
	// Antes esto lo gatillaba el manifiesto al entrar en pantalla, y era un
	// error: si alguien llega con un ancla en la URL o scrollea de un saque, ese
	// momento no ocurre nunca y el índice no aparecía más.
	const visible = activa !== null
	const [abierto, setAbierto] = useState(false)
	const boton = useRef<HTMLButtonElement>(null)
	const panel = useRef<HTMLDivElement>(null)

	// Qué sección está en pantalla. Por IntersectionObserver y no por cuentas
	// sobre el scroll: el pin del hero agrega ~240vh de spacer después del
	// montaje y cualquier posición calculada queda corrida.
	useEffect(() => {
		const nodos = SECCIONES.map((s) => document.getElementById(s.id)).filter(
			(n): n is HTMLElement => n !== null
		)
		if (!nodos.length) return

		// El margen negativo deja una franja fina en el medio del viewport: la
		// sección que la cruza es la activa. Sin eso, con secciones de varias
		// pantallas hay dos o tres intersecando a la vez y el índice titila.
		const io = new IntersectionObserver(
			(entradas) => {
				const dentro = entradas.find((e) => e.isIntersecting)
				if (dentro) setActiva(dentro.target.id)
			},
			{ rootMargin: '-50% 0px -49% 0px' }
		)
		nodos.forEach((n) => io.observe(n))
		return () => io.disconnect()
	}, [])

	// Mientras el índice está abierto la página no scrollea detrás. Se bloquea
	// con `overflow` y no moviendo el body a `position: fixed`: eso último
	// resetea el scroll y además le corre las posiciones a los pines de GSAP.
	useEffect(() => {
		if (!abierto) return
		const previo = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = previo
		}
	}, [abierto])

	// Escape cierra, y el foco queda adentro del panel mientras esté abierto: es
	// una capa que tapa todo, así que tabular hacia afuera lleva a links que no
	// se ven.
	useEffect(() => {
		if (!abierto) return
		const enfocables = () =>
			Array.from(panel.current?.querySelectorAll<HTMLElement>('a[href], button') ?? [])
		enfocables()[0]?.focus()

		const alTeclado = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				setAbierto(false)
				boton.current?.focus()
				return
			}
			if (e.key !== 'Tab') return
			const lista = enfocables()
			if (!lista.length) return
			const primero = lista[0]
			const ultimo = lista[lista.length - 1]
			if (e.shiftKey && document.activeElement === primero) {
				e.preventDefault()
				ultimo.focus()
			} else if (!e.shiftKey && document.activeElement === ultimo) {
				e.preventDefault()
				primero.focus()
			}
		}
		document.addEventListener('keydown', alTeclado)
		return () => document.removeEventListener('keydown', alTeclado)
	}, [abierto])

	return (
		<>
			{/* --- mobile: botón + panel a pantalla completa ----------------- */}
			<button
				ref={boton}
				type="button"
				onClick={() => setAbierto(true)}
				aria-expanded={abierto}
				aria-controls="indice-panel"
				className={`fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] right-6 z-40 border border-gold bg-surface-primary px-5 py-3 font-mono text-etiqueta uppercase text-gold-bright transition-opacity duration-500 lg:hidden ${
					visible && !abierto ? 'opacity-100' : 'pointer-events-none opacity-0'
				}`}
			>
				Índice
			</button>
			{abierto && (
				<div
					id="indice-panel"
					ref={panel}
					role="dialog"
					aria-modal="true"
					aria-label="Secciones de la página"
					className="fixed inset-0 z-50 flex flex-col overflow-y-auto overscroll-contain bg-surface-primary px-6 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] pt-[calc(2rem+env(safe-area-inset-top,0px))] lg:hidden"
				>
					<div className="flex items-center justify-between">
						<p className="font-mono text-etiqueta uppercase text-gold">Índice</p>
						<button
							type="button"
							onClick={() => {
								setAbierto(false)
								boton.current?.focus()
							}}
							className="font-mono text-etiqueta uppercase text-fg-secondary transition-colors hover:text-gold-bright"
						>
							Cerrar ✕
						</button>
					</div>

					<ul className="mt-auto flex list-none flex-col gap-6 py-14">
						{SECCIONES.map((s) => (
							<li key={s.id}>
								<a
									href={`#${s.id}`}
									onClick={() => setAbierto(false)}
									aria-current={s.id === activa ? 'true' : undefined}
									className="flex items-baseline gap-5"
								>
									<span
										className={`font-mono text-etiqueta tabular-nums ${
											s.id === activa ? 'text-gold-bright' : 'text-fg-muted'
										}`}
									>
										{s.numero}
									</span>
									<span
										className={`font-heading text-titulo-xs font-normal ${
											s.id === activa ? 'text-gold-bright' : 'text-fg-primary'
										}`}
									>
										{s.nombre}
									</span>
								</a>
							</li>
						))}
					</ul>
				</div>
			)}
			{/* --- desktop: riel al borde derecho ----------------------------- */}
			en el contenedor y `auto` en cada link: el índice // cubre una franja alta de la
			pantalla y si no, se come los clicks y el // arrastre del carrusel que pasa por debajo.
			<nav
				aria-label="Secciones de la página"
				className={`pointer-events-none fixed right-0 top-1/2 z-30 hidden -translate-y-1/2 pr-7 mix-blend-difference transition-opacity duration-700 lg:block ${
					visible ? 'opacity-100' : 'opacity-0'
				}`}
			>
				<ul className="flex list-none flex-col items-end gap-4">
					{SECCIONES.map((s) => {
						const esActiva = s.id === activa
						return (
							<li key={s.id}>
								<a
									href={`#${s.id}`}
									aria-current={esActiva ? 'true' : undefined}
									className="group pointer-events-auto flex items-center justify-end gap-3 py-1 font-mono text-etiqueta-s uppercase text-fg-primary"
								>
									<span
										className={`whitespace-nowrap transition-opacity duration-300 ${
											esActiva
												? 'opacity-100'
												: 'opacity-0 group-hover:opacity-60 group-focus-visible:opacity-100'
										}`}
									>
										{s.nombre}
									</span>
									<span
										className={`tabular-nums transition-opacity duration-300 ${
											esActiva
												? 'opacity-100'
												: 'opacity-45 group-hover:opacity-100'
										}`}
									>
										{s.numero}
									</span>
									<span
										aria-hidden
										className={`block h-px bg-fg-primary transition-all duration-300 ${
											esActiva
												? 'w-7 opacity-100'
												: 'w-3 opacity-45 group-hover:w-5'
										}`}
									/>
								</a>
							</li>
						)
					})}
				</ul>
			</nav>
		</>
	)
}

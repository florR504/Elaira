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
	{ id: 'historia', numero: '01', nombre: 'Mi historia', corto: 'Historia' },
	{ id: 'proposito', numero: '02', nombre: 'Mi propósito', corto: 'Propósito' },
	{ id: 'servicios', numero: '03', nombre: 'Mis servicios', corto: 'Servicios' },
	{ id: 'testimonios', numero: '04', nombre: 'Testimonios', corto: 'Testimonios' },
	{ id: 'sabias-que', numero: '05', nombre: 'Sabías que', corto: 'Sabías que' },
	{ id: 'preguntas', numero: '06', nombre: 'Preguntas frecuentes', corto: 'Preguntas' },
	{ id: 'contacto', numero: '07', nombre: 'Contacto', corto: 'Contacto' },
]

/**
 * Navegación de la página. En desktop, una barra superior que aparece al
 * scrollear hacia arriba; en mobile, un botón fijo que abre el índice a
 * pantalla completa.
 *
 * Resuelve dos cosas a la vez en una página de trece pantallas: llegar a una
 * sección sin recorrerlas todas, y saber cuánto falta — hasta ahora se
 * scrolleaba sin ninguna señal de posición.
 *
 * Va en `mix-blend-difference` para cruzar los dos bloques claros —propósito y
 * testimonios— sin tener que detectar sobre qué fondo está: el modo de fusión
 * lo invierte solo. Por eso el color es `fg-primary` y no un gris ni el dorado:
 * la diferencia del dorado contra el hueso da un azul que no es de la paleta.
 *
 * Aparece recién pasado el hero: hasta que una sección numerada no cruza el
 * medio de la pantalla no hay nada que marcar. Ahí el wordmark se abre letra
 * por letra y ocupa todo; cualquier cosa encima le compite.
 */
export function Navegacion() {
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
	const [subiendo, setSubiendo] = useState(false)
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

	// La barra aparece al scrollear hacia arriba y se va al bajar. El umbral de
	// seis píxeles descarta el temblor del trackpad y el rebote del scroll
	// suave, que si no la hacen parpadear.
	useEffect(() => {
		let ultimo = window.scrollY
		const alScrollear = () => {
			const y = window.scrollY
			if (Math.abs(y - ultimo) < 6) return
			setSubiendo(y < ultimo)
			ultimo = y
		}
		window.addEventListener('scroll', alScrollear, { passive: true })
		return () => window.removeEventListener('scroll', alScrollear)
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
			{/* --- desktop: barra superior ------------------------------------ */}
			{/* Aparece al scrollear hacia arriba, que es cuando alguien está
			    buscando algo, y no estorba mientras se lee hacia abajo. Nunca
			    durante el hero: ahí el wordmark ocupa toda la pantalla.
			    Lleva fondo propio y no `mix-blend-difference` como las versiones
			    anteriores: son siete links en fila y cruzan la lámina del slider
			    de servicios, donde la fusión los vuelve ilegibles. */}
			<header
				className={`fixed inset-x-0 top-0 z-40 hidden border-b border-hairline bg-surface-primary/90 backdrop-blur-md transition-transform duration-500 lg:block ${
					visible && subiendo ? 'translate-y-0' : '-translate-y-full'
				}`}
			>
				<div className="mx-auto flex h-16 w-full max-w-pagina items-center justify-between gap-10 px-6 md:px-margen">
					<a
						href="#"
						className="font-display text-cuerpo-l tracking-widest text-fg-primary transition-colors hover:text-gold-bright"
					>
						ELAÏRA
					</a>

					<nav aria-label="Secciones de la página">
						<ul className="flex list-none items-center gap-7">
							{SECCIONES.map((s) => {
								const esActiva = s.id === activa
								return (
									<li key={s.id}>
										<a
											href={`#${s.id}`}
											aria-current={esActiva ? 'true' : undefined}
											className={`font-mono text-etiqueta-s uppercase transition-colors ${
												esActiva
													? 'text-gold-bright'
													: 'text-fg-secondary hover:text-fg-primary'
											}`}
										>
											{s.corto}
										</a>
									</li>
								)
							})}
						</ul>
					</nav>

					<a
						href="#contacto"
						className="flex h-9 shrink-0 items-center border border-gold px-5 font-mono text-etiqueta-s uppercase text-gold-bright transition-colors hover:bg-gold hover:text-surface-primary"
					>
						Reservar
					</a>
				</div>
			</header>
		</>
	)
}

'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'

/** useLayoutEffect avisa en SSR; en el server no hay layout que medir. */
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/** Píxeles que tiene que recorrer el cursor antes de soltar la próxima estrella. */
const PASO = 80

/** Tamaño y color por posición del pool. Fijos y no aleatorios: con random en
 *  el render, el HTML del server y el del cliente no coinciden y React tira
 *  error de hidratación. La variación aleatoria se aplica al soltarlas. */
const TAMANOS = [14, 20, 11, 26, 16, 22, 13, 18]
const COLORES = ['text-gold-bright', 'text-fg-primary', 'text-gold-bright', 'text-gold']
const POOL = 20

/** Cuatro puntas cóncavas: la estrella clásica de grabado esotérico. */
const PUNTA =
	'M12 0c.8 7.4 4.6 11.2 12 12-7.4.8-11.2 4.6-12 12-.8-7.4-4.6-11.2-12-12C7.4 11.2 11.2 7.4 12 0Z'

/** Halo tenue para que las estrellas se despeguen del negro. */
const BRILLO = 'brillo-estrella'

/**
 * Rastro de estrellas al mover el cursor, más el propio cursor convertido en
 * estrella. Vale para toda la página: se monta una vez en el layout y no
 * envuelve nada, porque las dos capas ya eran `fixed` al viewport y las
 * posiciones salen de `clientX/clientY`. Acotarlo a una sección era solo el
 * chequeo contra el rect de esa sección.
 *
 * Una sola instancia y no una por sección: son 20 nodos y un `ticker`
 * compartido. Dos montadas se pisarían con dos cursores y dos rastros.
 *
 * Reutiliza un pool fijo de 20 estrellas en vez de crear nodos: al pasar la
 * última vuelve a la primera. Mover el mouse rápido durante un minuto no
 * agrega un solo elemento al DOM.
 *
 * Solo con mouse: en `pointer: coarse` no hay cursor que seguir, y con
 * `prefers-reduced-motion` no se engancha nada. En los dos casos salimos antes
 * de registrar listeners, así que no cuesta ni un frame. Por eso `cursor:none`
 * se aplica desde el efecto y no por clase: si lo pusiéramos en el CSS, quien
 * tenga movimiento reducido se quedaría sin cursor y sin reemplazo.
 */
export function RastroEstrellas() {
	const capa = useRef<HTMLDivElement>(null)
	const cursor = useRef<HTMLDivElement>(null)

	useIsoLayoutEffect(() => {
		const grueso = window.matchMedia('(pointer: coarse)').matches
		const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
		if (grueso || reducido) return

		const cursorEl = cursor.current
		if (!cursorEl) return

		const estrellas = gsap.utils.toArray<HTMLElement>('[data-estrella]', capa.current)
		if (!estrellas.length) return

		// En el <html> y no en el <body>: el body puede no llegar al alto de la
		// ventana y ahí abajo volvía a aparecer el cursor del sistema.
		const raiz = document.documentElement
		raiz.style.cursor = 'none'

		const siguiente = gsap.utils.wrap(0, estrellas.length)
		let i = 0
		let pos = { x: 0, y: 0 }
		let ultima = { x: 0, y: 0 }
		let dentro = false

		// quickTo da el retardo suave del cursor sin crear un tween por frame.
		const xa = gsap.quickTo(cursorEl, 'x', { duration: 0.22, ease: 'power3' })
		const ya = gsap.quickTo(cursorEl, 'y', { duration: 0.22, ease: 'power3' })
		gsap.set(cursorEl, { xPercent: -50, yPercent: -50, opacity: 0, scale: 0.6 })
		const giro = gsap.to(cursorEl, {
			rotation: 360,
			duration: 12,
			repeat: -1,
			ease: 'none',
		})

		const mostrar = (ahora: boolean) => {
			if (ahora === dentro) return
			dentro = ahora
			gsap.to(cursorEl, {
				opacity: ahora ? 1 : 0,
				scale: ahora ? 1 : 0.6,
				duration: 0.3,
				ease: 'power2.out',
			})
		}

		const onMove = (e: PointerEvent) => {
			pos = { x: e.clientX, y: e.clientY }
			xa(pos.x)
			ya(pos.y)
			mostrar(true)
		}

		// Al salir de la ventana la estrella se apaga; si no, queda clavada en
		// el borde. `relatedTarget` nulo es lo que distingue salir del documento
		// de pasar de un elemento a otro adentro.
		const onOut = (e: PointerEvent) => {
			if (!e.relatedTarget) mostrar(false)
		}

		// Al cambiar de pestaña no llega ningún pointer event, así que el estado
		// se limpia acá: si no, se vuelve con la estrella donde quedó.
		const onBlur = () => mostrar(false)

		// Sobre un link la estrella crece: sin cursor nativo, es la única señal
		// de que eso se puede clickear.
		const onOver = (e: PointerEvent) => {
			const sobreLink = (e.target as Element)?.closest?.('a, button')
			gsap.to(cursorEl, {
				scale: sobreLink ? 1.9 : dentro ? 1 : 0.6,
				duration: 0.25,
				ease: 'power2.out',
			})
		}

		const soltar = (el: HTMLElement) => {
			gsap.killTweensOf(el)
			gsap.set(el, { clearProps: 'all' })
			gsap.set(el, {
				opacity: 1,
				left: pos.x,
				top: pos.y,
				xPercent: -50,
				yPercent: -50,
			})

			const escala = gsap.utils.random(0.6, 1.2)
			gsap.timeline()
				.from(el, {
					opacity: 0,
					scale: 0,
					duration: 0.6,
					ease: 'elastic.out(1, 0.4)',
				})
				.to(el, { scale: escala, duration: 0.6 }, 0)
				.to(el, { rotation: gsap.utils.random(-160, 160), duration: 1.6 }, 0)
				.to(
					el,
					{
						y: `+=${gsap.utils.random(90, 180)}`,
						duration: 1.6,
						ease: 'back.in(0.4)',
					},
					0
				)
				// La opacidad se separa del movimiento: se mantiene en 1 mientras
				// cae y recién se apaga al final. Atada al mismo tween, la estrella
				// se desvanecía apenas aparecía.
				.to(el, { opacity: 0, duration: 0.55, ease: 'power2.in' }, 1.05)
		}

		const tick = () => {
			if (!dentro) return
			const recorrido = Math.hypot(ultima.x - pos.x, ultima.y - pos.y)
			if (recorrido < PASO) return
			ultima = pos
			soltar(estrellas[siguiente(i++)])
		}

		window.addEventListener('pointermove', onMove)
		document.addEventListener('pointerover', onOver)
		document.addEventListener('pointerout', onOut)
		window.addEventListener('blur', onBlur)
		gsap.ticker.add(tick)

		return () => {
			window.removeEventListener('pointermove', onMove)
			document.removeEventListener('pointerover', onOver)
			document.removeEventListener('pointerout', onOut)
			window.removeEventListener('blur', onBlur)
			gsap.ticker.remove(tick)
			giro.kill()
			gsap.killTweensOf([...estrellas, cursorEl])
			raiz.style.cursor = ''
		}
	}, [])

	return (
		<>
			<div
				ref={capa}
				aria-hidden
				className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
			>
				{Array.from({ length: POOL }, (_, i) => (
					<svg
						key={i}
						data-estrella
						viewBox="0 0 24 24"
						width={TAMANOS[i % TAMANOS.length]}
						height={TAMANOS[i % TAMANOS.length]}
						className={`absolute opacity-0 ${COLORES[i % COLORES.length]} ${BRILLO}`}
						fill="currentColor"
					>
						<path d={PUNTA} />
					</svg>
				))}
			</div>

			<div
				ref={cursor}
				aria-hidden
				className="pointer-events-none fixed left-0 top-0 z-50 opacity-0"
			>
				<svg
					viewBox="0 0 24 24"
					width={30}
					height={30}
					className={`text-gold-bright ${BRILLO}`}
					fill="currentColor"
				>
					<path d={PUNTA} />
				</svg>
			</div>
		</>
	)
}

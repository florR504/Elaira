'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import gsap from 'gsap'
import { Draggable } from 'gsap/Draggable'

gsap.registerPlugin(Draggable)

/**
 * Distancia entre carta y carta dentro del bucle, en unidades de tiempo de la
 * timeline. Su inversa es cuántas cartas se ven a la vez: con 0.1 son diez.
 *
 * Ese número tiene que entrar en la cantidad de nodos del DOM. Si no entra,
 * una misma carta vuelve a entrar en escena antes de que su instancia anterior
 * haya salido y, al ser el mismo nodo, el segundo tween le pisa la posición al
 * primero: la carta que debería irse por la izquierda se teletransporta al
 * punto de entrada. Por eso cada pregunta se renderiza dos veces — es lo mismo
 * que hace el demo del que sale esto, que repite siete imágenes para llegar a
 * catorce cartas.
 */
const PASO = 0.1

/** Cuántas veces se repite cada pregunta en la pista. */
const COPIAS = 2

export type PreguntaCarta = {
	numeral: string
	etiqueta: string
	imagen: string
	pregunta: string
	respuesta: string
}

type Props = { preguntas: PreguntaCarta[] }

/**
 * Sigue `prefers-reduced-motion` sin un efecto de por medio: es estado que vive
 * afuera de React. El snapshot de server devuelve `true` para que el primer
 * HTML nunca prometa una animación.
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

/**
 * Arma un bucle sin costura a partir de una animación por elemento.
 *
 * El truco es de GSAP y vale la pena entenderlo antes de tocarlo: las
 * animaciones "de verdad" viven en `crudo`, una timeline pausada donde cada
 * carta aparece varias veces, escalonada. `bucle` no anima cartas: lo único
 * que hace es mover el cabezal de `crudo` de un punto a otro y volver atrás
 * hasta un punto equivalente, elegido para que las cartas en pantalla estén
 * exactamente en la misma posición. Por eso el salto no se ve.
 *
 * Las animaciones de más a cada lado (`solape`) existen para eso: en el
 * momento del salto tiene que haber cartas ya en escena en los dos extremos.
 */
function armarBucle(
	elementos: HTMLElement[],
	paso: number,
	animar: (el: HTMLElement) => gsap.core.Timeline
) {
	const solape = Math.ceil(1 / paso)
	const inicio = elementos.length * paso + 0.5
	const fin = (elementos.length + solape) * paso + 1
	const crudo = gsap.timeline({ paused: true })
	const bucle = gsap.timeline({ paused: true, repeat: -1 })

	for (let i = 0; i < elementos.length + solape * 2; i++) {
		crudo.add(animar(elementos[i % elementos.length]), i * paso)
	}

	crudo.time(inicio)
	bucle.to(crudo, { time: fin, duration: fin - inicio, ease: 'none' }).fromTo(
		crudo,
		{ time: solape * paso + 1 },
		{
			time: inicio,
			duration: inicio - (solape * paso + 1),
			immediateRender: false,
			ease: 'none',
		}
	)
	return bucle
}

/**
 * Carrusel infinito de preguntas: las cartas cruzan la pantalla de derecha a
 * izquierda, creciendo hasta el centro y apagándose al salir.
 *
 * A diferencia del demo de GSAP del que sale, no secuestra el scroll de la
 * página. En el demo el bucle lo maneja un ScrollTrigger con `pin` que, al
 * llegar al final, devuelve el scroll al principio: en una página de una sola
 * pantalla eso es infinito y está bien, pero en medio de una landing significa
 * que nadie puede pasar de acá a contacto. Acá el bucle se mueve arrastrando,
 * con las flechas del teclado o con los botones, y la página scrollea normal.
 *
 * Las cinco preguntas están siempre en el DOM y en orden, así que un lector de
 * pantalla las lee enteras sin depender de la animación.
 */
export function CarruselPreguntas({ preguntas }: Props) {
	const pista = useRef<HTMLUListElement>(null)
	const tirador = useRef<HTMLDivElement>(null)
	const mover = useRef<(offset: number) => void>(null)
	const [activa, setActiva] = useState(0)
	const reducido = useMovimientoReducido()

	const total = preguntas.length

	// La pista lleva las preguntas repetidas; las copias van `aria-hidden` para
	// que un lector de pantalla lea cada pregunta una sola vez.
	const tarjetas = Array.from({ length: total * COPIAS }, (_, i) => ({
		...preguntas[i % total],
		copia: Math.floor(i / total),
	}))

	useEffect(() => {
		const lista = pista.current
		if (!lista || reducido) return

		const cartas = gsap.utils.toArray<HTMLElement>(lista.children)
		gsap.set(cartas, { xPercent: 300, opacity: 0, scale: 0 })

		// Cada carta entra desde la derecha, crece hasta tamaño completo en el
		// centro y se apaga al salir. El `yoyo` del primer tween es lo que hace
		// las dos mitades con una sola animación.
		const animar = (el: HTMLElement) =>
			gsap
				.timeline()
				.fromTo(
					el,
					{ scale: 0.35, opacity: 0 },
					{
						scale: 1,
						opacity: 1,
						zIndex: 100,
						duration: 0.5,
						yoyo: true,
						repeat: 1,
						ease: 'power1.in',
						immediateRender: false,
					}
				)
				.fromTo(
					el,
					{ xPercent: 300 },
					{ xPercent: -300, duration: 1, ease: 'none', immediateRender: false },
					0
				)

		const bucle = armarBucle(cartas, PASO, animar)
		const envolver = gsap.utils.wrap(0, bucle.duration())
		const alPaso = gsap.utils.snap(PASO)
		const cabezal = { offset: 0 }

		// Un solo tween reutilizado: `invalidate().restart()` en vez de crear uno
		// nuevo por gesto. Es lo que hace que el arrastre no acumule tweens.
		const suave = gsap.to(cabezal, {
			offset: 0,
			duration: 0.5,
			ease: 'power3',
			paused: true,
			onUpdate() {
				bucle.time(envolver(cabezal.offset))
				const n = total * COPIAS
				setActiva((((Math.round(cabezal.offset / PASO) % n) + n) % n) % total)
			},
		})

		const irA = (offset: number) => {
			suave.vars.offset = offset
			suave.invalidate().restart()
		}
		mover.current = (delta: number) => irA(alPaso(suave.vars.offset ?? 0) + delta)

		bucle.time(0)

		let arranque = 0
		const arrastre = Draggable.create(tirador.current, {
			type: 'x',
			trigger: lista,
			onPress() {
				arranque = (suave.vars.offset as number) ?? 0
			},
			onDrag() {
				irA(arranque + (this.startX - this.x) * 0.0016)
			},
			onDragEnd() {
				irA(alPaso((suave.vars.offset as number) ?? 0))
			},
		})

		return () => {
			arrastre.forEach((d) => d.kill())
			suave.kill()
			bucle.kill()
			gsap.set(cartas, { clearProps: 'all' })
			mover.current = null
		}
	}, [reducido, total])

	const paso = useCallback((delta: number) => mover.current?.(delta), [])

	const onKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowRight') paso(PASO)
		if (e.key === 'ArrowLeft') paso(-PASO)
	}

	return (
		<div
			role="group"
			aria-roledescription="carrusel"
			aria-label="Preguntas frecuentes"
			onKeyDown={onKeyDown}
			className="w-full"
		>
			{/* Sin movimiento el carrusel no tiene sentido: las cartas quedarían
			    apiladas en el centro. Se muestran como lista, que además es la
			    forma en que las preguntas se leen mejor. */}
			<ul
				ref={pista}
				className={
					reducido
						? 'flex list-none flex-col gap-6'
						: 'relative mx-auto grid h-[26rem] w-[17rem] list-none touch-pan-y place-items-center sm:h-[28rem] sm:w-[19rem]'
				}
			>
				{(reducido ? preguntas.map((p) => ({ ...p, copia: 0 })) : tarjetas).map((p, i) => (
					<li
						key={`${p.numeral}-${p.copia}`}
						aria-hidden={p.copia > 0 || undefined}
						aria-current={
							!reducido && i % total === activa && p.copia === 0 ? 'true' : undefined
						}
						className={
							reducido
								? 'w-full'
								: 'col-start-1 row-start-1 h-full w-full will-change-transform'
						}
					>
						<article className="relative flex h-full flex-col overflow-hidden border border-gold bg-surface-wine p-6 text-left sm:p-7">
							<div
								aria-hidden
								className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.16] mix-blend-screen"
								style={{ backgroundImage: `url(${p.imagen})` }}
							/>
							<div className="relative flex items-baseline justify-between gap-4">
								<span className="font-display text-cuerpo-xl tracking-widest text-gold-bright">
									{p.numeral}
								</span>
								<span className="font-mono text-etiqueta-s uppercase text-fg-on-wine-soft">
									{p.etiqueta}
								</span>
							</div>
							<h3 className="relative mt-6 font-heading text-titulo-2xs font-normal text-fg-primary">
								{p.pregunta}
							</h3>
							<p className="relative mt-4 text-cuerpo-s text-fg-on-wine-soft">
								{p.respuesta}
							</p>
						</article>
					</li>
				))}
			</ul>

			{!reducido && (
				<>
					{/* Draggable necesita un elemento propio al que mover: el gesto se
					    lee de él y lo que se anima es el cabezal del bucle. */}
					<div ref={tirador} aria-hidden className="invisible absolute" />

					<div className="mt-12 flex items-center justify-center gap-8">
						<button
							type="button"
							onClick={() => paso(-PASO)}
							className="font-mono text-etiqueta uppercase text-fg-secondary transition-colors hover:text-gold-bright"
						>
							← Anterior
						</button>
						<p className="font-mono text-etiqueta tabular-nums text-fg-muted">
							<span className="text-gold-bright">{preguntas[activa].numeral}</span> /{' '}
							{preguntas[total - 1].numeral}
						</p>
						<button
							type="button"
							onClick={() => paso(PASO)}
							className="font-mono text-etiqueta uppercase text-fg-secondary transition-colors hover:text-gold-bright"
						>
							Siguiente →
						</button>
					</div>
				</>
			)}
		</div>
	)
}

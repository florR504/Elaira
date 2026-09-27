'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Fotogramas del ciclo. 0 es luna llena, 24 luna nueva, y el 47 enlaza con el 0. */
const TOTAL = 48
const RUTA = (i: number) => `/luna/luna_${String(i).padStart(2, '0')}.webp`

/** Lado máximo del disco en píxeles CSS. Los archivos miden 440: por encima de
 *  eso se estaría ampliando, y en una foto de cráteres se nota enseguida. */
const LADO_MAX = 420

export type FaseLunar = {
	/** Fracción iluminada a la que corresponde, de 0 a 1. */
	nombre: string
	descripcion: string
}

type Props = {
	/**
	 * Qué decir en cada fase. El índice es la fase, de luna llena a luna llena:
	 * llena, menguante, cuarto menguante, creciente menguante… El componente
	 * elige una según el fotograma, así que el largo del array define en cuántos
	 * tramos se parte el ciclo.
	 */
	fases: FaseLunar[]
}

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
 * La luna recorre un ciclo completo mientras la sección cruza el viewport.
 *
 * Es una secuencia de imágenes dibujada en un canvas, no un degradado ni una
 * máscara: el terminador —la línea entre luz y sombra— es la proyección de un
 * círculo máximo sobre una esfera, así que en los cuartos sale recto y en las
 * fases intermedias es una elipse. Calcularlo bien en CSS no se puede, y
 * aproximarlo con dos círculos da una silueta que no es la de la Luna.
 *
 * Los 48 fotogramas se descargan recién cuando la sección se acerca, no al
 * cargar la página: son 1,3 MB y no tienen por qué competir con el hero. Hasta
 * que llegan se muestra el primero, que es el único que se pide con prioridad.
 */
export function SecuenciaLunar({ fases }: Props) {
	const seccion = useRef<HTMLDivElement>(null)
	const lienzo = useRef<HTMLCanvasElement>(null)
	const imagenes = useRef<(HTMLImageElement | undefined)[]>([])
	const lado = useRef(0)
	const cuadro = useRef({ i: 0 })

	const [fase, setFase] = useState(0)
	const [iluminada, setIluminada] = useState(100)
	const reducido = useMovimientoReducido()

	// Dibuja el fotograma actual y deriva de él los textos. La fracción
	// iluminada sale del coseno del ángulo de fase, que es la misma cuenta con
	// la que se generaron las imágenes.
	useEffect(() => {
		const canvas = lienzo.current
		const ctx = canvas?.getContext('2d')
		if (!canvas || !ctx) return

		const medir = () => {
			const dpr = Math.min(window.devicePixelRatio || 1, 2)
			lado.current = Math.round(
				Math.min(window.innerWidth * 0.62, window.innerHeight * 0.44, LADO_MAX)
			)
			canvas.width = lado.current * dpr
			canvas.height = lado.current * dpr
			canvas.style.width = `${lado.current}px`
			canvas.style.height = `${lado.current}px`
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
			pintar()
		}

		const pintar = () => {
			const i = cuadro.current.i
			const img = imagenes.current[i]
			ctx.clearRect(0, 0, lado.current, lado.current)
			if (img) ctx.drawImage(img, 0, 0, lado.current, lado.current)

			const k = (1 - Math.cos(2 * Math.PI * (i / TOTAL) + Math.PI)) / 2
			setIluminada(Math.round(k * 100))
			setFase(Math.round((i / TOTAL) * fases.length) % fases.length)
		}

		// El primero entra aparte para que haya luna desde el principio; el
		// resto llega en orden y cada uno repinta si es el que toca.
		const cargar = (i: number) => {
			if (imagenes.current[i]) return
			const img = new Image()
			img.onload = () => {
				imagenes.current[i] = img
				if (cuadro.current.i === i) pintar()
			}
			img.src = RUTA(i)
		}
		cargar(0)

		medir()
		window.addEventListener('resize', medir)

		// El resto se pide cuando la sección está a una pantalla de distancia.
		const io = new IntersectionObserver(
			([e]) => {
				if (!e.isIntersecting) return
				io.disconnect()
				for (let i = 1; i < TOTAL; i++) cargar(i)
			},
			{ rootMargin: '100% 0px' }
		)
		if (seccion.current) io.observe(seccion.current)

		if (reducido)
			return () => {
				window.removeEventListener('resize', medir)
				io.disconnect()
			}

		// `snap` porque los fotogramas son discretos: sin él, el índice llega
		// fraccionado y el redondeo lo hace saltar de a dos en los bordes.
		const animacion = gsap.to(cuadro.current, {
			i: TOTAL - 1,
			snap: 'i',
			ease: 'none',
			scrollTrigger: {
				trigger: seccion.current,
				start: 'top top',
				end: 'bottom bottom',
				scrub: 0.5,
			},
			onUpdate: pintar,
		})

		return () => {
			window.removeEventListener('resize', medir)
			io.disconnect()
			animacion.scrollTrigger?.kill()
			animacion.kill()
		}
	}, [fases.length, reducido])

	const actual = fases[fase]

	return (
		// El alto es lo que le da recorrido al scroll: la luna se queda pegada
		// arriba mientras la sección entera lo atraviesa. Con movimiento reducido
		// no hay recorrido que dar —el ciclo no corre—, así que el bloque se
		// achica a una pantalla en vez de dejar cuatro de negro vacío.
		<div ref={seccion} className={`relative ${reducido ? '' : 'h-[400svh]'}`}>
			<div className="sticky top-0 flex h-svh flex-col items-center justify-center gap-8 px-6 md:gap-10">
				{/* El nombre va arriba del disco, y con alto reservado: sin eso,
				    cambiar de "Luna nueva" a "Gibosa menguante" mueve la luna. */}
				<div className="flex min-h-[4.5rem] flex-col items-center gap-2 text-center md:min-h-[5.5rem]">
					<p
						aria-live="polite"
						className="font-heading text-titulo-xs font-normal text-fg-primary"
					>
						{actual.nombre}
					</p>
					<p className="font-mono text-etiqueta uppercase text-fg-muted tabular-nums">
						{iluminada}% iluminada
					</p>
				</div>

				<canvas
					ref={lienzo}
					role="img"
					aria-label={`Luna en fase ${actual.nombre.toLowerCase()}, ${iluminada}% iluminada`}
					className="block [filter:drop-shadow(0_0_70px_rgba(150,170,255,0.14))]"
				/>

				<p className="min-h-[5.5rem] max-w-[34rem] text-center text-cuerpo text-fg-secondary md:min-h-[4.5rem]">
					{actual.descripcion}
				</p>
			</div>
		</div>
	)
}

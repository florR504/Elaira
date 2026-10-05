'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Fotogramas del ciclo completo, para la cuenta de la fracción iluminada.
 *  0 es luna llena y 24 luna nueva. */
const TOTAL = 48

/** Hasta dónde llega el recorrido: la luna nueva. Pasado ese punto la Luna
 *  vuelve a crecer y las siluetas son las mismas de la primera mitad,
 *  espejadas, así que el scroll seguiría avanzando sin mostrar nada nuevo. */
const ULTIMO = 24
const RUTA = (i: number) => `/luna/luna_${String(i).padStart(2, '0')}.webp`

/** Lado máximo del disco en píxeles CSS. Los archivos miden 440, así que acá
 *  se está ampliando: en una foto de cráteres con el borde difuminado aguanta
 *  bien, pero subir mucho más de esto ya se empieza a ver blando. */
const LADO_MAX = 680

/** Alto que hay que reservarle al texto en mobile, donde va arriba y abajo del
 *  disco: el nombre de la fase, el porcentaje, la lectura —que puede llegar a
 *  ocho líneas— y el buscador. Sale de medir la lectura más larga de las ocho,
 *  con una fecha ya cargada, que es el peor caso. En pantallas altas no manda
 *  este término sino el ancho; en las bajas achica el disco en vez de dejar
 *  que el contenido se desborde. En desktop el texto va al costado y el disco
 *  se queda con toda la ventana. */
const RESERVADO = 500

/** Mes sinódico: lo que tarda la Luna en volver a la misma fase. */
const SINODICO = 29.530588853

/** Una luna nueva de referencia, en UTC. A partir de ella se cuenta todo. */
const LUNA_NUEVA = Date.UTC(2000, 0, 6, 18, 14)

/**
 * Fracción del ciclo transcurrida desde la luna nueva, de 0 a 1: 0 es nueva y
 * 0.5 es llena.
 *
 * Usa el mes sinódico medio. La duración real de cada lunación varía unas
 * horas, así que sobre décadas el resultado puede correrse medio día — nada,
 * teniendo en cuenta que cada una de las ocho fases dura casi cuatro.
 */
function fraccionDelCiclo(fecha: Date) {
	const dias = (fecha.getTime() - LUNA_NUEVA) / 86_400_000
	return (((dias / SINODICO) % 1) + 1) % 1
}

/**
 * Fotograma que le corresponde a una fecha. El 0 es luna llena y el 24 luna
 * nueva, así que hay que correr media vuelta el origen del cálculo.
 */
function cuadroDeLaFecha(fecha: Date) {
	return Math.round(fraccionDelCiclo(fecha) * TOTAL + TOTAL / 2) % TOTAL
}

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

/** El remate: lo que la fase deja planteado lo responde la carta natal. */
function Cierre() {
	return (
		<>
			<p className="mt-7 text-cuerpo text-fg-primary">
				Tu fase lunar es un dato. Tu carta natal son cientos.
			</p>
			<a
				href="#contacto"
				className="mt-4 inline-flex items-center gap-2.5 border-b border-gold pb-2 font-mono text-etiqueta uppercase text-gold-bright transition-colors hover:text-gold"
			>
				Reservar carta natal
				<span aria-hidden>↗</span>
			</a>
		</>
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
	const [fijada, setFijada] = useState<Date | null>(null)
	const saltarA = useRef<((cuadro: number) => void) | null>(null)
	const reducido = useMovimientoReducido()

	// Dibuja el fotograma actual y deriva de él los textos. La fracción
	// iluminada sale del coseno del ángulo de fase, que es la misma cuenta con
	// la que se generaron las imágenes.
	useEffect(() => {
		const canvas = lienzo.current
		const ctx = canvas?.getContext('2d')
		const estado = cuadro.current
		if (!canvas || !ctx) return

		const medir = () => {
			const anchas = window.matchMedia('(min-width: 768px)').matches
			lado.current = Math.round(
				anchas
					? Math.min(window.innerWidth * 0.46, window.innerHeight - 96, LADO_MAX)
					: Math.min(window.innerWidth * 0.68, window.innerHeight - RESERVADO, LADO_MAX)
			)
			const dpr = Math.min(window.devicePixelRatio || 1, 2, 880 / lado.current)
			canvas.width = lado.current * dpr
			canvas.height = lado.current * dpr
			canvas.style.width = `${lado.current}px`
			canvas.style.height = `${lado.current}px`
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
			pintar()
		}

		const pintar = () => {
			const i = estado.i
			const img = imagenes.current[i]
			ctx.clearRect(0, 0, lado.current, lado.current)
			if (img) ctx.drawImage(img, 0, 0, lado.current, lado.current)

			const k = (1 - Math.cos(2 * Math.PI * (i / TOTAL) + Math.PI)) / 2
			setIluminada(Math.round(k * 100))
			// Sobre el ciclo entero y no sobre el tramo que recorre el scroll:
			// así la misma cuenta sirve para el recorrido y para una fecha, que
			// puede caer en la mitad creciente.
			setFase(Math.round((i / TOTAL) * fases.length) % fases.length)
		}

		// El primero entra aparte para que haya luna desde el principio; el
		// resto llega en orden y cada uno repinta si es el que toca.
		const cargar = (i: number) => {
			if (imagenes.current[i]) return
			const img = new Image()
			img.onload = () => {
				imagenes.current[i] = img
				if (estado.i === i) pintar()
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
		const animacion = gsap.to(estado, {
			i: ULTIMO,
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

		// Saltar a un fotograma concreto: lo usa el buscador de fecha. Apaga el
		// ScrollTrigger porque si no el siguiente movimiento de scroll le devuelve
		// la luna al recorrido y le borra el resultado a quien acaba de buscarlo.
		saltarA.current = (destino: number) => {
			animacion.scrollTrigger?.disable(false)
			gsap.to(estado, {
				i: destino,
				duration: 1.1,
				ease: 'power2.inOut',
				onUpdate: pintar,
			})
		}

		return () => {
			window.removeEventListener('resize', medir)
			io.disconnect()
			saltarA.current = null
			gsap.killTweensOf(estado)
			animacion.scrollTrigger?.kill()
			animacion.kill()
		}
	}, [fases.length, reducido])

	const actual = fases[fase]

	const buscar = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const valor = new FormData(e.currentTarget).get('fecha')
		if (typeof valor !== 'string' || !valor) return
		// En UTC y no en hora local: `new Date('2004-07-12')` ya se interpreta
		// como medianoche UTC, y mezclarlo con la hora local corre la cuenta un
		// día en husos al oeste de Greenwich.
		const fecha = new Date(`${valor}T00:00:00Z`)
		if (Number.isNaN(fecha.getTime())) return
		setFijada(fecha)
		saltarA.current?.(cuadroDeLaFecha(fecha))
	}

	return (
		<>
			{/* El alto es lo que le da recorrido al scroll: la luna se queda pegada
			    arriba mientras la sección entera lo atraviesa. Con movimiento
			    reducido no hay recorrido que dar, así que el bloque se achica a
			    una pantalla en vez de dejar varias de negro vacío. */}
			<div ref={seccion} className={`relative ${reducido ? '' : 'h-[260svh]'}`}>
				<div className="sticky top-0 flex h-svh flex-col items-center justify-center gap-4 px-6 md:flex-row md:gap-[6%] md:px-margen">
					{/* En desktop el disco va a la izquierda y el texto al costado; en
				    mobile se apila con el nombre arriba y la lectura abajo.
				    Un solo DOM para las dos disposiciones: la columna de texto es
				    `display:contents` en mobile —sus hijos pasan a ser items del
				    mismo flex que el canvas— y el intercalado lo resuelve `order`.
				    Tocar cualquiera de los dos rompe el orden en mobile. */}
					<canvas
						ref={lienzo}
						role="img"
						aria-label={`Luna en fase ${actual.nombre.toLowerCase()}, ${iluminada}% iluminada`}
						className="order-2 block shrink-0 md:order-none [filter:drop-shadow(0_0_70px_rgba(150,170,255,0.14))]"
					/>

					{/* Ancho fijo en desktop: si la columna se encoge con los nombres
				    cortos, la fila se recentra y el disco se mueve. */}
					<div className="contents md:flex md:w-[24rem] md:flex-col md:items-start md:gap-6">
						<div className="order-1 flex min-h-[4.5rem] flex-col items-center gap-2 text-center md:order-none md:min-h-0 md:items-start md:text-left">
							<p
								aria-live="polite"
								className="font-heading text-titulo-xs font-normal text-fg-primary md:text-titulo-s"
							>
								{actual.nombre}
							</p>
							<p className="font-mono text-etiqueta uppercase tabular-nums text-fg-muted">
								{iluminada}% iluminada
							</p>
						</div>

						<p className="order-3 min-h-[5.5rem] max-w-[34rem] text-center text-cuerpo-s text-fg-secondary md:order-none md:min-h-0 md:max-w-none md:text-left md:text-cuerpo">
							{actual.descripcion}
						</p>

						{/* El buscador es lo que cierra la sección: hasta acá el recorrido
					    levanta la pregunta "¿cuál es la mía?" y no la contesta. Al
					    enviar una fecha la luna viaja hasta esa fase y el llamado a
					    reservar cae justo donde el interés está más alto. */}
						<div className="order-4 w-full max-w-[34rem] border-t border-hairline pt-7 md:order-none md:max-w-none">
							<form onSubmit={buscar} className="flex flex-wrap items-end gap-4">
								<div className="flex flex-1 flex-col gap-2">
									<label
										htmlFor="fecha-nacimiento"
										className="font-mono text-etiqueta uppercase text-fg-muted"
									>
										¿Cuál es la tuya?
									</label>
									<input
										id="fecha-nacimiento"
										name="fecha"
										type="date"
										required
										max={new Date().toISOString().slice(0, 10)}
										className="w-full border border-hairline bg-surface-raised px-4 py-3 text-cuerpo text-fg-primary outline-none transition-colors focus:border-gold"
									/>
								</div>
								<button
									type="submit"
									className="h-[50px] shrink-0 border border-gold px-6 font-mono text-etiqueta uppercase text-gold-bright transition-colors hover:bg-gold hover:text-surface-primary"
								>
									Ver mi fase
								</button>
							</form>

							{fijada && (
								<p
									aria-live="polite"
									className="mt-5 text-cuerpo-s text-fg-secondary"
								>
									El{' '}
									{fijada.toLocaleDateString('es-AR', {
										day: 'numeric',
										month: 'long',
										year: 'numeric',
										timeZone: 'UTC',
									})}{' '}
									la Luna estaba en{' '}
									<span className="text-gold-bright">
										{actual.nombre.toLowerCase()}
									</span>
									.
								</p>
							)}

							{/* En desktop el cierre entra en la columna; en mobile no, así
						    que ahí se renderiza después del bloque fijo. */}
							<div className="hidden md:block">
								<Cierre />
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* El cierre no entra adentro del bloque fijo en mobile: con el nombre,
			    la luna, la lectura y el buscador ya se pasa del alto de pantalla y
			    el contenido se desborda por los dos lados. Acá abajo, además, se
			    lee mejor: llega cuando terminaste de buscar tu fase. */}
			<div className="px-6 pb-24 md:hidden">
				<Cierre />
			</div>
		</>
	)
}

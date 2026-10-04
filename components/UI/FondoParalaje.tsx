'use client'

import { useEffect, useLayoutEffect, useRef, type CSSProperties } from 'react'
import gsap from 'gsap'

/** useLayoutEffect avisa en SSR; en el server no hay layout que medir. */
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * Desvanece el cielo contra la página en los cuatro bordes, para que no se vea
 * el rectángulo del archivo. Dos degradados intersectados, uno por eje, así los
 * vértices se difuminan más que los bordes rectos. Vive acá y no en cada
 * sección: es parte de qué significa "fondo" en este sitio, no una decisión de
 * quien lo usa. Igual se puede pisar pasando `style`. Se exporta para las capas
 * de mobile, que son el mismo cielo pero sin paralaje.
 */
export const MASCARA_CIELO = [
	'linear-gradient(to bottom, transparent 0, #000 220px, #000 calc(100% - 220px), transparent 100%)',
	'linear-gradient(to right, transparent 0, #000 110px, #000 calc(100% - 110px), transparent 100%)',
].join(', ')

type Props = {
	/** Clases de la capa: la que lleva la imagen. */
	className?: string
	/** Pisa la máscara de bordes, que se aplica a la ventana y no a la capa. */
	style?: CSSProperties
	/**
	 * Espeja la imagen en horizontal. Para repetir el mismo cielo en otra
	 * sección sin que se lea como la misma foto pegada dos veces.
	 */
	espejada?: boolean
	/**
	 * A qué fracción de la velocidad del contenido va el cielo. 1 sería ir
	 * pegado a la página, o sea sin paralaje; 0 sería quedarse clavado al
	 * viewport. Por debajo de 0.8 se nota; por debajo de 0.4 el fondo se va
	 * tanto que se lee como otra capa suelta.
	 */
	velocidad?: number
}

/**
 * Fondo con paralaje: el cielo sube más lento que el contenido mientras el
 * bloque cruza el viewport.
 *
 * La capa cubre el bloque y viaja con él; lo que cambia por frame es el
 * `background-position`, que corre la imagen hacia abajo justo lo que haga
 * falta para que el saldo sea la fracción de velocidad pedida. Es una resta,
 * no una posición absoluta, y por eso funciona igual en un bloque de 700px que
 * en una sección de 4.000: no depende de que el bloque sea más alto que el
 * viewport.
 *
 * Esa independencia es el punto. Antes la capa iba `sticky` y del alto de la
 * pantalla, que anda mientras el contenedor le deje margen para pegarse; en un
 * bloque más bajo que el viewport no hay margen, la capa viaja con la página y
 * el desplazamiento de la imagen se *suma* en vez de restar: el cielo terminaba
 * yendo al doble de velocidad que el texto, justo al revés de lo que se busca.
 *
 * Lo que se mueve es el `background-position` y no la capa porque el sobrante
 * de la imagen no le cuesta alto a nadie: con `100% auto` sobre una imagen
 * apaisada siempre sobra mucho más de lo que se recorre. Trasladar la capa
 * obligaría a agrandarla, y agrandarla trae de vuelta el problema de arriba.
 *
 * Se lee el rect por frame en vez de usar ScrollTrigger: el pin del hero agrega
 * ~240vh de spacer después de que estos componentes montaron, y cualquier
 * posición cacheada queda corrida. El ticker solo corre mientras el bloque está
 * en pantalla.
 */
export function FondoParalaje({ className = '', style, espejada, velocidad = 0.65 }: Props) {
	const ventana = useRef<HTMLDivElement>(null)
	const capa = useRef<HTMLDivElement>(null)

	useIsoLayoutEffect(() => {
		const ventanaEl = ventana.current
		const capaEl = capa.current
		if (!ventanaEl || !capaEl) return
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

		// quickSetter escribe la propiedad sin crear un tween por frame.
		const mover = gsap.quickSetter(capaEl, 'backgroundPositionY', '%') as (v: number) => void

		// El sobrante que hay para correr sale del alto real de la imagen, y ese
		// alto depende del archivo. Se mide una vez: `background-size: 100% auto`
		// lo ata al ancho de la capa, así que alcanza con la proporción.
		let proporcion = 0
		const url = getComputedStyle(capaEl).backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1]
		if (url) {
			const img = new Image()
			img.onload = () => {
				proporcion = img.naturalHeight / img.naturalWidth
			}
			img.src = url
		}

		let visible = false

		const tick = () => {
			if (!visible || !proporcion) return
			const r = ventanaEl.getBoundingClientRect()
			const alto = window.innerHeight
			const sobra = r.width * proporcion - r.height
			if (sobra <= 0) return

			// Recorrido del bloque de punta a punta del viewport, y cuánto lleva
			// hecho. Centrado en la mitad: ahí la imagen queda sin correr.
			const total = alto + r.height
			const hecho = gsap.utils.clamp(0, total, alto - r.top) - total / 2

			// La imagen baja mientras el bloque sube: el signo va al revés del
			// avance a propósito. Lo que queda a la vista es la resta, o sea el
			// cielo moviéndose a `velocidad` de lo que se mueve el contenido.
			const deriva = -(1 - velocidad) * hecho
			mover(gsap.utils.clamp(0, 100, 50 + (deriva / sobra) * 100))
		}

		const io = new IntersectionObserver(([entrada]) => {
			visible = entrada.isIntersecting
			if (visible) tick()
		})
		io.observe(ventanaEl)
		gsap.ticker.add(tick)

		return () => {
			io.disconnect()
			gsap.ticker.remove(tick)
			gsap.set(capaEl, { clearProps: 'backgroundPositionY' })
		}
	}, [velocidad])

	return (
		<div
			ref={ventana}
			aria-hidden
			style={{
				maskImage: MASCARA_CIELO,
				WebkitMaskImage: MASCARA_CIELO,
				maskComposite: 'intersect',
				WebkitMaskComposite: 'source-in',
				...style,
			}}
			className="pointer-events-none absolute inset-0 -z-10"
		>
			{/* Centrada en reposo: con movimiento reducido no corre el ticker y
			    este es el encuadre que queda.
			    `100% auto` y no `cover`: la imagen se ajusta al ancho y todo lo que
			    sobre de alto es margen para recorrer. Con `cover` ese sobrante
			    depende de la proporción del bloque y en uno ancho y bajo puede ser
			    cero, o sea fondo quieto. */}
			<div
				ref={capa}
				className={`h-full w-full bg-center [background-size:100%_auto] ${
					espejada ? '-scale-x-100' : ''
				} ${className}`}
			/>
		</div>
	)
}

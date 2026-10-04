'use client'

import { useEffect, useLayoutEffect, useRef, type ReactNode, type RefObject } from 'react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'

/** useLayoutEffect avisa en SSR; en el server no hay layout que medir. */
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

type Props = {
	children: ReactNode
	className?: string
	/** Retraso entre línea y línea, en segundos. */
	stagger?: number
	/** Espera antes de arrancar, en segundos. Para escalonar dos bloques. */
	delay?: number
}

/**
 * Entrada por líneas enmascaradas: cada renglón sube desde abajo de su propia
 * ventana, como si el texto se revelara detrás de una persiana. Es la técnica
 * de la demo `text-masking` de GSAP — SplitText con `mask: 'lines'` y un
 * `from` escalonado.
 *
 * `autoSplit` es lo que la hace confiable con tipografía web: SplitText corta
 * por líneas y los cortes dependen de la fuente y del ancho. Al cargar la
 * fuente o al cambiar el ancho, vuelve a partir el texto y `onSplit` rearma el
 * tween sobre las líneas nuevas. Si el bloque ya se había revelado, la
 * animación se salta al final en vez de repetirse: rearmar no es volver a
 * entrar.
 *
 * Se dispara con IntersectionObserver y no con ScrollTrigger, por lo mismo que
 * `Reveal`: el pin del hero agrega ~240vh de spacer después de que estos
 * componentes montaron, y ScrollTrigger cachea posiciones que quedan corridas.
 *
 * Con `prefers-reduced-motion` sale antes de partir nada: el texto queda tal
 * cual, sin wrappers ni líneas ocultas esperando un tween que no va a correr.
 */
export function TextoEnmascarado({ children, className, stagger = 0.12, delay = 0 }: Props) {
	const ref = useRef<HTMLDivElement>(null)

	useIsoLayoutEffect(() => {
		const el = ref.current
		if (!el) return
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

		gsap.registerPlugin(SplitText)

		// SplitText reescribe el HTML del bloque. En dev, StrictMode monta el
		// efecto dos veces y `revert()` sobre un DOM que ya volvió a partirse
		// dejaba el titular cortado a la mitad. Guardar el original y
		// reponerlo al desmontar cierra ese caso sin depender del revert.
		const original = el.innerHTML

		let visible = false
		let revelado = false
		let animacion: gsap.core.Tween | undefined

		// Se parten los hijos y no el wrapper: con un bloque anidado adentro,
		// SplitText toma al <h2> entero como si fuera una sola línea y lo mete
		// dentro de la máscara, dejando el titular cortado en el primer
		// renglón. Apuntando al propio titular corta por líneas de verdad.
		const split = SplitText.create(gsap.utils.toArray(el.children), {
			type: 'lines',
			mask: 'lines',
			// El padding contra el recorte de la máscara vive en globals.css:
			// GSAP le agrega el sufijo `-mask` a cada clase que se le pase para
			// nombrar los wrappers, y con clases sueltas de Tailwind eso
			// generaba nombres inventados.
			linesClass: 'linea-enmascarada',
			autoSplit: true,
			onSplit(self) {
				animacion = gsap.from(self.lines, {
					yPercent: 100,
					duration: 1,
					ease: 'expo.out',
					stagger,
					delay,
					paused: true,
				})

				if (revelado) animacion.progress(1)
				else if (visible) {
					revelado = true
					animacion.play()
				}

				return animacion
			},
		})

		const io = new IntersectionObserver(
			([entrada]) => {
				if (!entrada.isIntersecting) return
				io.disconnect()
				visible = true
				revelado = true
				animacion?.play()
			},
			{ threshold: 0.2 }
		)
		io.observe(el)

		return () => {
			io.disconnect()
			animacion?.kill()
			split.revert()
			el.innerHTML = original
		}
	}, [stagger, delay])

	return (
		<div ref={ref as RefObject<HTMLDivElement>} className={className}>
			{children}
		</div>
	)
}

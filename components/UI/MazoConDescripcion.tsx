'use client'

import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	type ReactNode,
} from 'react'
import gsap from 'gsap'
import { MazoTarot, type CartaData } from './MazoTarot'

/** useLayoutEffect avisa en SSR; en el server no hay layout que medir. */
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export type PreguntaCarta = CartaData & {
	pregunta: string
	respuesta: string
}

type Props = {
	preguntas: PreguntaCarta[]
	/** El bloque de título, renderizado en el server. */
	children: ReactNode
}

/**
 * Mazo + respuesta de la pregunta que está adelante.
 *
 * Existe solo para sostener el índice de la carta activa: el mazo lo emite y
 * la descripción lo consume. El título llega como `children` para que lo siga
 * renderizando el server component y no se arrastre al bundle del cliente.
 *
 * En desktop la descripción queda a la izquierda del mazo; en mobile, arriba.
 * Es el mismo orden de DOM en los dos casos, solo cambia la dirección del flex.
 */
export function MazoConDescripcion({ preguntas, children }: Props) {
	const [activo, setActivo] = useState(0)
	const panel = useRef<HTMLDivElement>(null)

	// La respuesta entra escalonada cada vez que cambia la carta de adelante.
	useIsoLayoutEffect(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
		const items = panel.current ? Array.from(panel.current.children) : []
		if (!items.length) return

		const tween = gsap.fromTo(
			items,
			{ y: 16, opacity: 0 },
			{ y: 0, opacity: 1, duration: 0.45, ease: 'power2.out', stagger: 0.07 }
		)
		return () => {
			tween.kill()
		}
	}, [activo])

	const onCambio = useCallback((i: number) => setActivo(i), [])
	const p = preguntas[activo]

	return (
		<div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between md:gap-24">
			<div className="md:max-w-[520px]">
				{children}

				<div ref={panel} className="mt-10 md:mt-14" key={activo}>
					<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold md:text-[12px]">
						{p.numeral} — {p.etiqueta}
					</p>
					<h3 className="mt-4 font-heading text-[clamp(1.5rem,2.2vw,30px)] font-normal leading-[1.25] tracking-[-0.02em] text-fg-primary md:mt-5">
						{p.pregunta}
					</h3>
					<p className="mt-4 text-[15px] leading-[1.7] text-fg-secondary md:mt-6 md:text-[19px] md:leading-[1.6]">
						{p.respuesta}
					</p>
				</div>
			</div>

			<MazoTarot cartas={preguntas} onCambio={onCambio} className="shrink-0" />
		</div>
	)
}

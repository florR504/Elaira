'use client'

import Image from 'next/image'
import { useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** useLayoutEffect avisa en SSR; en el server no hay layout que medir. */
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

const LETTERS = ['E', 'L', 'A', 'Ï', 'R', 'A']

/**
 * Hero — escena fijada. Mientras la página scrollea, la flor emerge y el
 * logotipo se abre letra por letra desde el centro. Terminado el recorrido,
 * el pin se suelta y la página sigue normal.
 */
export function Hero() {
	const root = useRef<HTMLElement>(null)
	const wordmark = useRef<HTMLSpanElement>(null)

	useIsoLayoutEffect(() => {
		const mm = gsap.matchMedia()

		mm.add('(prefers-reduced-motion: no-preference)', () => {
			const letters = gsap.utils.toArray<HTMLElement>('.wm__l', root.current)
			const mid = (letters.length - 1) / 2

			const offsetFor = (i: number) => {
				const w = wordmark.current?.offsetWidth ?? 0
				return (mid - i) * ((w / letters.length) * 0.86)
			}

			const tl = gsap.timeline({
				defaults: { ease: 'none' },
				scrollTrigger: {
					trigger: root.current,
					start: 'top top',
					end: '+=240%', // largo del recorrido: subilo y emerge más lento
					pin: true,
					scrub: 1,
					anticipatePin: 1,
					invalidateOnRefresh: true,
				},
			})

			tl.from('.bloom__soft', { opacity: 0, scale: 1.22 }, 0)
				.from('.bloom__sharp', { opacity: 0, scale: 0.86 }, 0.14)
				.to('.cue', { opacity: 0, duration: 0.18 }, 0)
				.from(
					letters,
					{
						x: offsetFor,
						opacity: 0,
						stagger: { each: 0.05, from: 'center' },
					},
					0.5
				)
		})

		document.fonts?.ready.then(() => ScrollTrigger.refresh())

		return () => mm.revert()
	}, [])

	return (
		<section
			ref={root}
			aria-labelledby="hero-title"
			className="relative h-screen w-full bg-surface-primary"
		>
			{/* clip y no hidden: `hidden` crearía un contenedor de scroll y mataría el pin.
			    sin crear contenedor de scroll, así el desborde vertical sigue
			    visible y las letras continúan sobre la sección siguiente. Va acá
			    y no en html: en el elemento raíz la propagación al viewport no
			    frena el scroll horizontal. */}
			<div className="@container relative mx-auto h-full w-full max-w-pagina overflow-x-clip">
				<div className="absolute inset-x-0 top-[-9%] mx-auto aspect-[1200/2135] h-[78%] md:top-[-26%] md:h-[112%]">
					<Image
						src="/flor-elaira.jpg"
						alt=""
						aria-hidden
						width={1200}
						height={2135}
						priority
						sizes="(min-width: 768px) 600px, 400px"
						className="bloom__soft absolute inset-0 h-full w-full scale-[1.04] object-contain opacity-[.62] mix-blend-screen blur-[30px] md:blur-[52px]"
					/>
					<Image
						src="/flor-elaira.jpg"
						alt="Flor roja de pétalos rasgados sobre fondo negro, imagen de marca de Elaïra"
						width={1200}
						height={2135}
						priority
						sizes="(min-width: 768px) 600px, 400px"
						className="bloom__sharp absolute inset-0 h-full w-full object-contain mix-blend-screen"
					/>
				</div>

				<h1
					id="hero-title"
					className="absolute inset-x-0 bottom-[8%] flex select-none justify-center font-display text-wordmark font-normal leading-none tracking-tight text-fg-primary md:bottom-[-10%]"
				>
					<span ref={wordmark} className="inline-block whitespace-nowrap">
						{LETTERS.map((letter, i) => (
							<span key={i} className="wm__l inline-block will-change-transform">
								{letter}
							</span>
						))}
					</span>
				</h1>

				<div className="cue absolute bottom-7 left-1/2 grid -translate-x-1/2 justify-items-center gap-3 motion-reduce:hidden">
					<span className="h-[34px] w-px bg-gradient-to-b from-red to-transparent" />
					<span className="text-etiqueta-s font-light uppercase tracking-cue text-fg-primary/40">
						deslizá
					</span>
				</div>
			</div>
		</section>
	)
}

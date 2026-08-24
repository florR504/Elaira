/**
 * Manifiesto — declaración a escala tipográfica, con un párrafo de apoyo
 * alineado a la derecha.
 *
 * Sin fondo propio: hereda el negro del body. Es a propósito — el logotipo
 * del hero desborda hacia acá y necesita pintarse encima. Un `bg` acá lo
 * taparía, porque el fondo de una sección se pinta por debajo de cualquier
 * elemento posicionado del hermano anterior.
 */
export function Manifiesto() {
	return (
		<section
			id="manifiesto"
			aria-labelledby="manifiesto-title"
			className="mx-auto w-full max-w-[1440px] px-6 py-20 md:px-[11%] md:py-[120px]"
		>
			<h2
				id="manifiesto-title"
				className="max-w-[16ch] font-heading text-[clamp(2.75rem,7.2vw,104px)] font-normal leading-[1.05] tracking-[-0.019em] text-fg-primary"
			>
				Somos producto de los pulsos de energía{' '}
				<em className="italic text-gold-bright">de las estrellas.</em>
			</h2>

			<p className="ml-auto mt-14 max-w-[420px] text-[15px] leading-[1.65] text-fg-secondary">
				No preguntes qué va a pasar. Preguntá lo que necesitás saber.
				Preguntá cuáles son los pasos a seguir. Si deseás algo, preguntate
				por qué - y que ganarás al perseguirlo.
			</p>
		</section>
	)
}

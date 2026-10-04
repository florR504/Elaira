/**
 * Manifiesto — declaración a escala tipográfica.
 *
 * No lleva `bg` propio a propósito: el logotipo del hero desborda hacia acá y
 * un fondo en esta sección lo taparía.
 */
export function Manifiesto() {
	return (
		<section
			id="manifiesto"
			aria-labelledby="manifiesto-title"
			className="mx-auto w-full max-w-pagina px-6 py-20 md:px-margen md:py-seccion-s"
		>
			<h2
				id="manifiesto-title"
				className="max-w-[16ch] font-heading text-titulo-xl font-normal text-fg-primary"
			>
				Somos producto de los pulsos de energía{' '}
				<em className="italic text-gold-bright">de las estrellas.</em>
			</h2>

			<p className="ml-auto mt-14 max-w-[420px] text-cuerpo text-fg-secondary">
				No preguntes qué va a pasar. Preguntá lo que necesitás saber. Preguntá cuáles son
				los pasos a seguir. Si deseás algo, preguntate por qué - y que ganarás al
				perseguirlo.
			</p>
		</section>
	)
}

import { FormularioWhatsapp } from '@/components/UI/FormularioWhatsapp'

/**
 * Número de destino, con código de país. Se lee en el server y baja por prop:
 * sin `NEXT_PUBLIC_` no se inlinea en el bundle, así que cambiarlo no obliga a
 * rebuildear. Vacío, el formulario se renderiza con el envío deshabilitado.
 */
const NUMERO_WHATSAPP = process.env.WHATSAPP_NUMERO ?? ''

/** Contacto — cierre de la página. El `#contacto` al que apuntan los CTA. */
export function Contacto() {
	return (
		<section
			id="contacto"
			aria-labelledby="contacto-title"
			className="w-full scroll-mt-16 bg-surface-wine"
		>
			<div className="mx-auto flex w-full max-w-pagina flex-col gap-10 px-6 py-20 md:flex-row md:items-start md:gap-16 md:px-margen md:py-seccion">
				<div className="md:w-[360px] md:shrink-0">
					<p className="font-mono text-etiqueta uppercase text-gold">(07) — Contacto</p>
					<h2
						id="contacto-title"
						className="mt-5 font-heading text-titulo-xs font-normal text-fg-primary"
					>
						¿Te quedó una pregunta que no está acá?
					</h2>
					<p className="mt-3 text-cuerpo text-fg-on-wine-soft">
						Escribime y te contesto yo, sin formularios automáticos ni respuestas
						armadas. Si la pregunta le sirve a alguien más, después la sumo a esta
						lista.
					</p>
				</div>
				<div className="md:flex-1">
					<FormularioWhatsapp numero={NUMERO_WHATSAPP} />
				</div>
			</div>
		</section>
	)
}

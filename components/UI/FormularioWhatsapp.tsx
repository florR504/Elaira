'use client'

import { useState } from 'react'

/**
 * Los temas de los chips. `frase` es cómo entra el tema en la oración, que no
 * es lo mismo que la etiqueta: el chip dice "Carta natal" y el mensaje tiene
 * que decir "una duda sobre la carta natal". Sin `frase` el mensaje queda sin
 * complemento, que es el caso de "Otra cosa".
 *
 * Los cinco primeros son los servicios, con los mismos nombres que en el
 * slider: si acá se llaman distinto, quien escribe no sabe si está preguntando
 * por lo mismo que vio arriba.
 */
const TEMAS = [
	{ id: 'carta-natal', etiqueta: 'Carta natal', frase: 'la carta natal' },
	{ id: 'progresiones', etiqueta: 'Progresiones', frase: 'las progresiones' },
	{ id: 'sinastria', etiqueta: 'Sinastría', frase: 'la sinastría' },
	{ id: 'oraculo', etiqueta: 'Lectura de oráculo', frase: 'la lectura de oráculo' },
	{ id: 'combo', etiqueta: 'Combo cósmico', frase: 'el combo cósmico' },
	{ id: 'reservas', etiqueta: 'Reservas y pagos', frase: 'cómo reservar y cómo se paga' },
	{ id: 'otra', etiqueta: 'Otra cosa', frase: '' },
] as const

type Tema = (typeof TEMAS)[number]

/** El mensaje que llega a WhatsApp ya escrito. */
function armarMensaje(tema: Tema) {
	return tema.frase
		? `Hola Elaïra, tengo una duda sobre ${tema.frase}.`
		: 'Hola Elaïra, tengo una duda.'
}

type Props = {
	/**
	 * Número de destino con código de país. Llega desde el entorno, así que se
	 * limpia acá: en un `.env` escrito a mano es normal que venga con +, espacios
	 * o guiones, y wa.me solo acepta dígitos.
	 */
	numero: string
}

/**
 * Formulario de contacto: elegís el tema, el mensaje se escribe solo y se abre
 * WhatsApp con ese texto ya cargado.
 *
 * No manda nada a un servidor: `wa.me` acepta el mensaje en la URL, así que el
 * "envío" es abrir ese link. Por eso no hay estado de carga ni de error, y por
 * eso el texto queda a la vista y editable antes de salir: es literalmente lo
 * que se va a mandar, no un resumen de lo que el formulario mandaría.
 *
 * El mensaje se regenera al cambiar de chip solo mientras nadie lo tocó. En
 * cuanto el texto difiere de la sugerencia, los chips dejan de pisarlo —lo
 * contrario sería borrarle a alguien lo que estaba escribiendo por tocar un
 * chip— y aparece el link para volver a la sugerencia. Si edita y después
 * deshace hasta dejarlo igual a la sugerencia, vuelve a comportarse como
 * intacto: la comparación es contra el texto, no un flag que queda pegado.
 *
 * Los colores son los tokens "sobre borgoña" y no los neutros, porque el
 * formulario vive en la sección vino: el hairline neutro desaparece contra ese
 * fondo y `fg-muted` queda ilegible. El campo se despega con
 * `surface-wine-deep`, el borgoña más oscuro de la rampa —en negro se leía
 * como un agujero en la sección—. Si algún día el formulario va también
 * sobre negro, esto es lo que hay que sacar a una prop de variante.
 */
export function FormularioWhatsapp({ numero }: Props) {
	const [tema, setTema] = useState<Tema>(TEMAS[0])
	const [mensaje, setMensaje] = useState(() => armarMensaje(TEMAS[0]))

	const sugerido = armarMensaje(tema)
	const editado = mensaje !== sugerido

	const destino = numero.replace(/\D/g, '')
	const listo = destino.length > 0 && mensaje.trim().length > 0

	const elegir = (nuevo: Tema) => {
		setTema(nuevo)
		if (!editado) setMensaje(armarMensaje(nuevo))
	}

	const enviar = (e: React.FormEvent) => {
		e.preventDefault()
		if (!listo) return
		// noopener además del rel: el rel no alcanza cuando la ventana se abre
		// por script y no por un click en el <a>.
		window.open(
			`https://wa.me/${destino}?text=${encodeURIComponent(mensaje)}`,
			'_blank',
			'noopener,noreferrer'
		)
	}

	return (
		<form onSubmit={enviar} className="flex flex-col gap-8">
			{/* Radios de verdad y no botones con aria-checked: así el grupo se
			    recorre con las flechas del teclado y se manda con el form sin que
			    haya que reimplementar nada. El input queda en sr-only y lo que se
			    ve es el label, que es lo que `peer-checked` pinta. */}
			<fieldset>
				<legend className="font-mono text-etiqueta uppercase text-fg-on-wine-soft">
					¿Sobre qué querés preguntar?
				</legend>
				<ul className="mt-4 flex list-none flex-wrap gap-2.5">
					{TEMAS.map((t) => (
						<li key={t.id}>
							<input
								type="radio"
								name="tema"
								id={`tema-${t.id}`}
								value={t.id}
								checked={t.id === tema.id}
								onChange={() => elegir(t)}
								className="peer sr-only"
							/>
							<label
								htmlFor={`tema-${t.id}`}
								className="block cursor-pointer border border-hairline-wine px-4 py-2.5 font-mono text-etiqueta uppercase text-fg-on-wine-soft transition-colors hover:border-gold/50 hover:text-fg-primary peer-checked:border-gold peer-checked:bg-surface-wine-deep peer-checked:text-gold-bright peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-gold"
							>
								{t.etiqueta}
							</label>
						</li>
					))}
				</ul>
			</fieldset>

			<div>
				<div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
					<label
						htmlFor="mensaje-whatsapp"
						className="font-mono text-etiqueta uppercase text-fg-on-wine-soft"
					>
						Tu mensaje
					</label>
					{editado && (
						<button
							type="button"
							onClick={() => setMensaje(sugerido)}
							className="font-mono text-etiqueta uppercase text-fg-on-wine-soft underline-offset-4 transition-colors hover:text-gold-bright hover:underline"
						>
							Volver al sugerido
						</button>
					)}
				</div>
				<textarea
					id="mensaje-whatsapp"
					value={mensaje}
					onChange={(e) => setMensaje(e.target.value)}
					rows={4}
					className="mt-3 block w-full resize-y border border-hairline-wine bg-surface-wine-deep px-5 py-4 text-cuerpo text-fg-primary outline-none transition-colors placeholder:text-fg-on-wine-soft focus:border-gold"
				/>
			</div>

			<div className="flex flex-wrap items-center gap-x-6 gap-y-3">
				<button
					type="submit"
					disabled={!listo}
					className="flex h-[50px] shrink-0 items-center justify-center gap-2.5 border border-gold px-7 font-mono text-etiqueta text-gold-bright transition-colors hover:bg-gold hover:text-surface-primary disabled:cursor-not-allowed disabled:border-hairline-wine disabled:text-fg-on-wine-soft disabled:hover:bg-transparent"
				>
					ENVIAR POR WHATSAPP
					<span aria-hidden>↗</span>
				</button>
				{!destino && (
					<p className="text-cuerpo-s text-fg-on-wine-soft">
						Falta configurar el número de WhatsApp.
					</p>
				)}
			</div>
		</form>
	)
}

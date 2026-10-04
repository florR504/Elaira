/**
 * DATO DE EJEMPLO. El mail viene del diseño de Pencil y hay que confirmarlo.
 * El Instagram sale del comentario del sistema de diseño, así que ese sí es
 * el real.
 */
const CONTACTO = [
	{ etiqueta: 'Escribime', valor: 'hola@elaira.mx', href: 'mailto:hola@elaira.mx' },
	{ etiqueta: 'Instagram', valor: '@elaira.mar', href: 'https://instagram.com/elaira.mar' },
]

/** Las mismas siete del índice, en el mismo orden y con la misma numeración. */
const SECCIONES = [
	{ id: 'historia', numero: '01', nombre: 'Mi historia' },
	{ id: 'proposito', numero: '02', nombre: 'Mi propósito' },
	{ id: 'servicios', numero: '03', nombre: 'Mis servicios' },
	{ id: 'testimonios', numero: '04', nombre: 'Testimonios' },
	{ id: 'sabias-que', numero: '05', nombre: 'Sabías que' },
	{ id: 'preguntas', numero: '06', nombre: 'Preguntas frecuentes' },
	{ id: 'contacto', numero: '07', nombre: 'Contacto' },
]

/**
 * Pie de página.
 *
 * Hasta ahora la página terminaba en el formulario y cortaba. Acá van los
 * datos que solo existían adentro de ese formulario —mail, Instagram,
 * dirección— y que alguien puede necesitar sin querer escribir todavía.
 *
 * El wordmark cortado por abajo cierra con la apertura: el hero arranca con
 * las letras saliéndose de la pantalla y la página termina igual.
 */
export function Footer() {
	return (
		<footer className="w-full border-t border-hairline bg-surface-primary">
			<div className="mx-auto w-full max-w-pagina px-6 pt-20 md:px-margen md:pt-seccion-s">
				<div className="flex flex-col gap-14 md:flex-row md:justify-between md:gap-20">
					<div className="md:max-w-[26rem]">
						<h2 className="font-heading text-titulo-xs font-normal text-fg-primary">
							¿Empezamos?
						</h2>
						<p className="mt-4 text-cuerpo text-fg-secondary">
							Escribime y te contesto yo, sin formularios automáticos ni respuestas
							armadas.
						</p>
						<a
							href="#contacto"
							className="mt-7 inline-flex items-center gap-2.5 border-b border-gold pb-2 font-mono text-etiqueta uppercase text-gold-bright transition-colors hover:text-gold"
						>
							Reservar una sesión
							<span aria-hidden>↗</span>
						</a>
					</div>

					<div className="flex flex-col gap-10 sm:flex-row sm:gap-20">
						<nav aria-label="Secciones">
							<p className="font-mono text-etiqueta-s uppercase text-fg-muted">
								La página
							</p>
							<ul className="mt-5 flex list-none flex-col gap-3">
								{SECCIONES.map((s) => (
									<li key={s.id}>
										<a
											href={`#${s.id}`}
											className="group flex items-baseline gap-3 text-cuerpo-s text-fg-secondary transition-colors hover:text-fg-primary"
										>
											<span className="font-mono text-etiqueta-s tabular-nums text-fg-muted transition-colors group-hover:text-gold">
												{s.numero}
											</span>
											{s.nombre}
										</a>
									</li>
								))}
							</ul>
						</nav>

						<div>
							<p className="font-mono text-etiqueta-s uppercase text-fg-muted">
								Dónde encontrarme
							</p>
							<ul className="mt-5 flex list-none flex-col gap-5">
								{CONTACTO.map((c) => (
									<li key={c.etiqueta} className="flex flex-col gap-1">
										<span className="font-mono text-etiqueta-s uppercase text-fg-muted">
											{c.etiqueta}
										</span>
										{c.href ? (
											<a
												href={c.href}
												className="text-cuerpo-s text-gold-bright transition-colors hover:text-gold"
											>
												{c.valor}
											</a>
										) : (
											<span className="max-w-[18ch] text-cuerpo-s text-fg-secondary">
												{c.valor}
											</span>
										)}
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</div>

			{/* El wordmark se corta por abajo a propósito: el hero abre con las
			    letras saliéndose de la pantalla y el pie cierra con el mismo gesto.
			    `select-none` porque es una firma, no un texto para copiar, y
			    aria-hidden porque el nombre ya lo dice el h1 del hero. */}
			<div aria-hidden className="mt-20 overflow-hidden md:mt-seccion-s">
				<p className="-mb-[0.22em] select-none text-center font-display text-titulo-xl font-normal leading-none tracking-widest text-fg-primary opacity-[0.07]">
					ELAÏRA
				</p>
			</div>

			<div className="mx-auto w-full max-w-pagina px-6 md:px-margen">
				<div className="flex flex-col gap-4 border-t border-hairline py-9 sm:flex-row sm:items-center sm:justify-between">
					<p className="font-mono text-etiqueta-s uppercase text-fg-muted">
						© {new Date().getFullYear()} Elaïra — Astrología y lectura de oráculo
					</p>
					<a
						href="#"
						className="font-mono text-etiqueta-s uppercase text-fg-muted transition-colors hover:text-gold-bright"
					>
						Volver arriba ↑
					</a>
				</div>
			</div>
		</footer>
	)
}

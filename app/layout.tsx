import type { Metadata } from 'next'
import { Bodoni_Moda, Geist, Geist_Mono, Playfair_Display } from 'next/font/google'
import './globals.css'
import { RastroEstrellas } from '@/components/UI/RastroEstrellas'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

const playfairDisplay = Playfair_Display({
	variable: '--font-playfair',
	subsets: ['latin'],
	style: ['normal', 'italic'],
})

// El eje `opsz` es lo que da las serifas de pelo en tamaños grandes.
// Sin él el navegador sirve una instancia estática y el logotipo pierde filo.
const bodoniModa = Bodoni_Moda({
	variable: '--font-bodoni',
	subsets: ['latin'],
	style: ['normal', 'italic'],
	axes: ['opsz'],
})

export const metadata: Metadata = {
	title: 'Elaïra — Astrología y lectura de oráculo',
	description:
		'Carta natal, progresiones, sinastría y lectura de oráculo. Sesiones en Roma Sur, CDMX, y por videollamada.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
	return (
		<html
			lang="es"
			className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} ${bodoniModa.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col">
				{children}
				{/* Va acá y no en la página: el rastro sigue al cursor por todo el
            sitio, header y footer incluidos, y así queda una sola instancia
            aunque mañana haya más rutas. */}
				<RastroEstrellas />
			</body>
		</html>
	)
}

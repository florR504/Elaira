import { Contacto } from '@/components/sections/Contacto'
import { Footer } from '@/components/sections/Footer'
import { Navegacion } from '@/components/UI/Navegacion'
import { Hero } from '@/components/sections/Hero'
import { Historia } from '@/components/sections/Historia'
import { Manifiesto } from '@/components/sections/Manifiesto'
import { Preguntas } from '@/components/sections/Preguntas'
import { SabiasQue } from '@/components/sections/SabiasQue'
import { Servicios } from '@/components/sections/Servicios'
import { Testimonios } from '@/components/sections/Testimonios'

export default function Home() {
	return (
		<>
			<main className="flex-1">
				<Navegacion />
				<Hero />
				<Manifiesto />
				<Historia />
				<Servicios />
				<Testimonios />
				<SabiasQue />
				<Preguntas />
				<Contacto />
			</main>
			<Footer />
		</>
	)
}

import { Contacto } from '@/components/sections/Contacto'
import { IndiceLateral } from '@/components/UI/IndiceLateral'
import { Hero } from '@/components/sections/Hero'
import { Historia } from '@/components/sections/Historia'
import { Manifiesto } from '@/components/sections/Manifiesto'
import { Preguntas } from '@/components/sections/Preguntas'
import { SabiasQue } from '@/components/sections/SabiasQue'
import { Servicios } from '@/components/sections/Servicios'
import { Testimonios } from '@/components/sections/Testimonios'

export default function Home() {
	return (
		<main className="flex-1">
			<IndiceLateral />
			<Hero />
			<Manifiesto />
			<Historia />
			<Servicios />
			<Testimonios />
			<SabiasQue />
			<Preguntas />
			<Contacto />
		</main>
	)
}

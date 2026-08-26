import { Hero } from '@/components/sections/Hero'
import { Historia } from '@/components/sections/Historia'
import { Manifiesto } from '@/components/sections/Manifiesto'
import { Preguntas } from '@/components/sections/Preguntas'

export default function Home() {
	return (
		<main className="flex-1">
			<Hero />
			<Manifiesto />
			<Historia />
			<Preguntas />
		</main>
	)
}

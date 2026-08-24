import { Hero } from '@/components/sections/Hero'
import { Historia } from '@/components/sections/Historia'
import { Manifiesto } from '@/components/sections/Manifiesto'

export default function Home() {
	return (
		<main className="flex-1">
			<Hero />
			<Manifiesto />
			<Historia />
		</main>
	)
}

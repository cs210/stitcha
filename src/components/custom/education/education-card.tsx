import { H3 } from "@/components/custom/text/headings";
import { P } from "@/components/custom/text/text";
import { Card } from "@/components/ui/card";
import { Education } from "@/lib/schemas/global.types";
import Image from "next/image";
import Link from "next/link";

// Education Card Component
export function EducationCard({ dict, education }: { dict: any; education: Education }) {
	return (
		<Card className='flex flex-row justify-center items-center p-4'>
			<Image src={education.thumbnail_url} alt={education.name} className='rounded-md' width={100} height={100} />

			<div className='flex flex-col justify-center items-start ml-4'>
				<Link href={`/dashboard/education/${education.id}`}>
					<H3 className='mt-2'>{education.name}</H3>
				</Link>
				<P className='mt-2'>{education.description}</P>
				<P className='mt-2'>
					{education.duration} {dict.general.time.minutes}
				</P>
			</div>
		</Card>
	);
}

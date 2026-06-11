import { map } from '$lib/game/game';
import type { RecordModel } from 'pocketbase';
import { get } from 'svelte/store';

export function haversine(
	lat1: number,
	lon1: number,
	height1: number,
	lat2: number,
	lon2: number,
	height2: number
): number {
	const R = 6378 * 1000; // Radius of the Earth in meters
	const rlat1 = lat1 * (Math.PI / 180); // Convert degrees to radians
	const rlat2 = lat2 * (Math.PI / 180); // Convert degrees to radians
	const difflat = rlat2 - rlat1; // Radian difference (latitudes)
	const difflon = (lon2 - lon1) * (Math.PI / 180); // Radian difference (longitudes)
	return (
		/*height2 -
		height1 +*/
		2 *
		R *
		Math.asin(
			Math.sqrt(
				Math.sin(difflat / 2) * Math.sin(difflat / 2) +
					Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(difflon / 2) * Math.sin(difflon / 2)
			)
		)
	);
}

export function score(
	ulat: number,
	ulong: number,
	uheight: number,
	plat: number,
	plong: number,
	pheight: number,
	guessed: boolean
): number {
	if (!guessed) return 0;
	const distance = haversine(ulat, ulong, uheight, plat, plong, pheight);
	if (pheight < 0) {
		//height is negative, use min distance meter
		const allowedOffset = 15;
		if (distance <= allowedOffset) {
			return 5000;
		}
		const a = 1 / (allowedOffset - get(map)!.minDistanceMeter);
		const b = -get(map)!.minDistanceMeter * a;
		return Math.round(Math.max(0, (a * distance + b) * 5000));
	} else {
		//height is positive, use telecom min distance meter
		const allowedOffset = 3;
		const height_distance = Math.abs(uheight - pheight);
		if (distance < allowedOffset && height_distance == 0) {
			return 5000;
		}
		const a = 1 / (allowedOffset - get(map)!.minTelecomDistanceMeter);
		const b = -get(map)!.minTelecomDistanceMeter * a;
		const distance_score = Math.max(0, (a * distance + b) * 5000);

		return Math.round(distance_score / (1 + height_distance / 2));
	}
}

export function computeTotalScore(user: RecordModel): number {
	let sum = 0;
	for (const value of Object.values(user.score)) {
		sum += Number(value);
	}
	return sum;
}

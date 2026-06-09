<script lang="ts">
	import { mount } from 'svelte';
	import { user } from '$lib/auth/auth';
	import { pb } from '$lib/pocketbase';
	import { game, map, prepareUsersForRound } from '$lib/game/game';
	import type { RecordModel } from 'pocketbase';
	import PlaneOverlay from '$lib/game/guess/plane/PlaneOverlay.svelte';
	import { Progress } from '$lib/components/ui/progress';
	import { Loader } from '@googlemaps/js-api-loader';
	import { get } from 'svelte/store';
	import type { google } from 'google-maps';
	import { score, haversine, computeTotalScore } from '$lib/game/result/result';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import ResetViewButton from '$lib/game/guess/ResetViewButton.svelte';
	import ResetMapButton from '$lib/game/guess/plane/ResetMapButton.svelte';
	import { PUBLIC_MAPS_API_KEY, PUBLIC_PB_URL } from '$env/static/public';
	import PartyPopper from 'lucide-svelte/icons/party-popper';
	import { Toggle } from '$lib/components/ui/toggle';

	//used to track round changes
	let round: number = get(game)!.round;
	let startDate: Date = $derived(new Date($game!.roundStart));
	let gmaps: google.maps.Map;
	let streetView: google.maps.StreetViewPanorama = $state();

	//used to track selected and current overlay
	let currentPlaneOverlay: PlaneOverlay;
	let selectedPlaneOverlay: PlaneOverlay | undefined;

	//used to track duration of the round
	let progress = $state(100);
	let remainingTime = $state(0);
	let truthMarker: google.maps.marker.AdvancedMarkerElement;

	//used for rendering the result at the end of the round
	let currScore: number = $state(0);
	let totScore: number = $derived(computeTotalScore(get(user)!) + currScore);
	let distance: number = $state(0);
	let placeName: string = $state('');

	const defaultCenter = { lat: 48.712840849038244, lng: 2.200140299650002 };
	const defaultZoom = 18;

	const loader = new Loader({
		apiKey: PUBLIC_MAPS_API_KEY,
		version: 'weekly',
		libraries: ['marker']
	});
	let placeLine: google.maps.Polyline;

	async function loadPanoramas() {
		let panoramaMap = new Map<string, google.maps.StreetViewPanoramaData>();
		const world = await pb.collection('world').getOne($map!.world, {
			expand: 'panoramas',
			fields: 'expand'
		});
		const panoramas: RecordModel[] = world.expand?.panoramas;
		//console.log(panoramas);
		//---- retrieve info for all panoramas ------
		for (let i = 0; i < panoramas.length; i++) {
			const panorama = panoramas[i];
			//get panorama link
			const panoramaExpanded = await pb.collection('panorama').getOne(panorama.id, {
				expand: 'link_via_from,link_via_to',
				fields: 'expand'
			});
			//also using backward links for the current panorama
			let fromPanoramaLinks = panoramaExpanded.expand?.link_via_from;
			if (!fromPanoramaLinks) fromPanoramaLinks = [];
			let toPanoramaLinks = panoramaExpanded.expand?.link_via_to;
			if (!toPanoramaLinks) toPanoramaLinks = [];
			//if this is a backward link, rotate the heading and trick the rest of the program into thinking this is a normal link
			toPanoramaLinks.forEach((value: RecordModel) => {
				value.heading = value.heading + 180;
				value.to = value.from;
			});
			const panoramaLinks = fromPanoramaLinks.concat(toPanoramaLinks);
			//create google panorama links
			let links: google.maps.StreetViewLink[] = panoramaLinks.map((link: RecordModel) => {
				return {
					description: null,
					heading: link.heading,
					pano: link.to
				};
			});

			//set google panorama value
			panoramaMap.set(panorama.id, {
				location: {
					pano: panorama.id,
					latLng: new google.maps.LatLng(panorama.latitude, panorama.longitude)
				},
				links: links,
				tiles: {
					tileSize: new google.maps.Size(1, 1),
					worldSize: new google.maps.Size(1, 1),
					centerHeading: panorama.centerHeading,
					getTileUrl: () => {
						return PUBLIC_PB_URL + '/api/files/panorama/' + panorama.id + '/' + panorama.image;
					}
				}
			});
		}
		return panoramaMap;
	}

	async function loadOverlays(
		gmaps: google.maps.Map,
		marker: google.maps.marker.AdvancedMarkerElement
	) {
		const planeIds = (await pb.collection('world').getOne($map!.world)).planes;
		const planes: RecordModel[] = [];
		for (const value of planeIds) {
			planes.push(await pb.collection('plane').getOne(value));
		}
		planes.sort((a, b) => {
			return b.height - a.height;
		});
		//create an overlay for each plane
		const overlays: PlaneOverlay[] = [];
		const container = document.createElement('div');
		const box = document.createElement('div');
		container.appendChild(box);
		container.style.display = 'flex';
		container.style.overflowY = 'auto';
		container.style.flexDirection = 'column';
		container.style.height = '90%';
		gmaps.controls[google.maps.ControlPosition.LEFT_CENTER].push(container);
		for (let i = 0; i < planes.length; i++) {
			const overlay = mount(PlaneOverlay, {
				target: container,
				props: {
					name: (planes.length - i - 1).toString(),
					model: planes[i],
					map: gmaps,
					defaultOverlay: i == planes.length - 1,
					selectOverlay: () => {
						currentPlaneOverlay.hide();
						overlay.show();
						currentPlaneOverlay = overlay;
						if (currentPlaneOverlay == selectedPlaneOverlay) {
							marker.map = gmaps;
						} else {
							marker.map = null;
						}
					}
				}
			});
			overlays.push(overlay);
			if (i == planes.length - 1) {
				currentPlaneOverlay = overlay;
			}
		}

		//gmaps.controls[google.maps.ControlPosition.LEFT_CENTER].push(container);
		mount(ResetMapButton, {
			target: container,
			props: {
				gmaps,
				center: defaultCenter,
				zoom: defaultZoom
			}
		});

		return overlays;
	}

	async function startTimer(gmaps: google.maps.Map) {
		const response = await fetch('/time');
		const string_time = await response.json();
		const time = new Date(string_time);
		const time_offset = new Date().getTime() - time.getTime();
		const timer = setInterval(async () => {
			let rt =
				$map!.durationSecondes * 1000 - (new Date().getTime() - time_offset - startDate.getTime());
			progress = Math.max(0, (rt / ($map!.durationSecondes * 1000)) * 100);
			remainingTime = Math.ceil(rt / 1000);

			if (progress == 0) {
				clearInterval(timer);
				const place = await pb.collection('panorama').getOne($map!.places[$game!.round], {
					fields: 'latitude,longitude,height,name'
				});

				if ($user!.guessed) {
					placeLine.setMap(gmaps);
					placeLine.setPath([
						new google.maps.LatLng($user?.selectedLatitude, $user?.selectedLongitude),
						new google.maps.LatLng(place.latitude, place.longitude)
					]);
				}

				currScore = score(
					$user!.selectedLatitude,
					$user!.selectedLongitude,
					$user!.selectedHeight,
					place.latitude,
					place.longitude,
					place.height,
					$user!.guessed
				);
				distance = haversine(
					$user!.selectedLatitude,
					$user!.selectedLongitude,
					$user!.selectedHeight,
					place.latitude,
					place.longitude,
					place.height
				);
				distance = Math.round(distance * 10) / 10;

				truthMarker.map = gmaps;
				truthMarker.position = new google.maps.LatLng(place.latitude, place.longitude);

				placeName = place.name;
				gmaps.setCenter({ lat: place.latitude, lng: place.longitude });
				gmaps.setZoom(17);
			}
		}, 250);
	}

	loader.importLibrary('maps').then(async ({ Map }) => {
		gmaps = new Map(document.getElementById('google-maps') as HTMLElement, {
			draggableCursor: 'crosshair',
			mapId: '362b47619054f064141dec0a',
			center: defaultCenter,
			zoom: defaultZoom,
			disableDefaultUI: true,
			zoomControl: true,
			maxZoom: 21,
			clickableIcons: false
		});

		let marker: google.maps.marker.AdvancedMarkerElement =
			new google.maps.marker.AdvancedMarkerElement({
				position: new google.maps.LatLng($user!.selectedLatitude, $user!.selectedLongitude),
				content: new google.maps.marker.PinElement({
					background: '#FBBC04',
					scale: 0.85
				}).element
			});

		gmaps.addListener('click', ({ latLng }) => {
			if (progress <= 0) {
				return;
			}
			if (typeof selectedPlaneOverlay != 'undefined') {
				selectedPlaneOverlay.deselect();
			}
			currentPlaneOverlay.select();
			selectedPlaneOverlay = currentPlaneOverlay;
			marker.map = gmaps;
			marker.position = new google.maps.LatLng(latLng.lat(), latLng.lng());
			pb.collection('user').update($user!.id, {
				selectedLatitude: latLng.lat(),
				selectedLongitude: latLng.lng(),
				selectedHeight: selectedPlaneOverlay.getModel().height,
				guessed: true
			});
		});

		let panoramaMap = await loadPanoramas();

		streetView = new google.maps.StreetViewPanorama(
			document.getElementById('street-view') as HTMLElement,
			{
				pano: $map!.places[round],
				visible: true,
				disableDefaultUI: true,
				linksControl: false,
				motionTracking: false,
				zoomControl: false,
				zoomControlOptions: {
					position: google.maps.ControlPosition.TOP_RIGHT
				},
				panControl: false
				/*panControlOptions: {
					position: google.maps.ControlPosition.TOP_RIGHT
				}*/
			}
		);

		//---- register pano provider ------
		streetView.registerPanoProvider((panoramaId: string) => {
			return panoramaMap.get(panoramaId);
		});

		const overlays = await loadOverlays(gmaps, marker);

		game.subscribe(async (ugame) => {
			if (ugame == null) return;
			if (ugame.round == round) return;
			//on round change
			round = ugame.round;
			streetView.setPano($map!.places[round]);
			gmaps.setZoom(15);
			gmaps.setCenter({ lat: 48.71234764550873, lng: 2.2007204982759454 });
			marker.map = null;
			selectedPlaneOverlay?.deselect();
			selectedPlaneOverlay = undefined;
			truthMarker.map = null;
			placeLine.setMap(null);
			progress = 100;
			switch ($map!.modifier) {
				case 'normal':
					streetView.setOptions({ clickToGo: true });
					break;
				case 'nomove':
					streetView.setOptions({ clickToGo: false });
					break;
				case 'nmpz':
					streetView.setOptions({ clickToGo: false });
					break;
			}
			await startTimer(gmaps);
		});

		//if the selected location is a valid one, it means that the user has already selected a location during this round
		if ($user!.guessed) {
			const overlay = overlays.filter((overlay) => {
				return overlay.getModel().height == $user!.selectedHeight;
			})[0];
			selectedPlaneOverlay = overlay;
			selectedPlaneOverlay.select();
			if (overlay == currentPlaneOverlay) {
				marker.map = gmaps;
			}
		}

		truthMarker = new google.maps.marker.AdvancedMarkerElement({
			map: null,
			content: new google.maps.marker.PinElement({
				background: '#7cff07',
				scale: 0.85
			}).element
		});

		placeLine = new google.maps.Polyline({
			strokeColor: '#f85a5a',
			strokeOpacity: 1.0,
			strokeWeight: 5,
			geodesic: true
		});

		let forumLogo = document.createElement('img');
		forumLogo.src =
			PUBLIC_PB_URL + '/api/files/image/3j3ijzld6f2vxkt/forum_logo2048px_li9kkMtB3n.png';
		forumLogo.style.width = '60px';
		forumLogo.style.height = '60px';
		forumLogo.style.marginRight = '5px';
		gmaps.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(forumLogo);

		let tgcLogo = document.createElement('img');
		tgcLogo.src =
			PUBLIC_PB_URL + '/api/files/image/fmzll08c6tggxdp/tgc_logo_orange_png_T6xbCyvga5.png';
		tgcLogo.style.width = '60px';
		tgcLogo.style.height = '60px';
		tgcLogo.style.marginRight = '5px';
		gmaps.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(tgcLogo);

		switch ($map!.modifier) {
			case 'normal':
				streetView.setOptions({
					zoomControl: false,
					scrollwheel: true,
					linksControl: true
				});
				break;
			case 'nomove':
				streetView.setOptions({
					zoomControl: false,
					scrollwheel: true,
					linksControl: false
				});
				break;
			case 'nmpz':
				streetView.setOptions({
					zoomControl: false,
					scrollwheel: false,
					linksControl: false
				});
				break;
		}
		await startTimer(gmaps);
	});
</script>

{#if progress > 0}
	<div class="absolute top-0 z-10 mt-2 flex w-full flex-col items-center gap-y-2">
		<Progress value={progress} max={100} class="w-[60%]" />
		<div class="rounded-full border-2 border-black px-4 py-1 text-lg">
			{remainingTime}s
		</div>
	</div>
{:else}
	<AlertDialog.Root open={true}>
		<AlertDialog.Trigger class="absolute left-[50%] top-5 z-10 translate-x-[-50%]">
			<Button>
				<PartyPopper />
				Voir les résultats</Button
			>
		</AlertDialog.Trigger>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>Il fallait trouver :</AlertDialog.Title>
				<AlertDialog.Description>
					{placeName}
				</AlertDialog.Description>
				<AlertDialog.Title>Distance :</AlertDialog.Title>
				<AlertDialog.Description>
					{#if $user?.guessed}
						{distance}m
					{:else}
						Vous n'avez pas répondu
					{/if}
				</AlertDialog.Description>
				<AlertDialog.Title>Score :</AlertDialog.Title>
				<AlertDialog.Description>
					Ce round: {currScore} / 5000 pts
				</AlertDialog.Description>
				<AlertDialog.Description>
					Total: {totScore}pts
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>Voir la carte</AlertDialog.Cancel>
				{#if $user?.isAdmin}
					<AlertDialog.Action
						onclick={async () => {
							await prepareUsersForRound();
							const response = await fetch('/time');
							const string_time = await response.json();
							const time = new Date(string_time);
							await pb.collection('game').update($game ? $game?.id : '', {
								round: $game?.round + 1,
								roundStart: time.toJSON()
							});
						}}>Round suivant</AlertDialog.Action
					>
				{/if}
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
{/if}
<div id="street-view" class="h-full w-full"></div>

<div
	class="absolute bottom-[5%] right-[2%] flex h-full w-full flex-col items-end justify-end gap-y-1"
>
	<div class="flex flex-row-reverse gap-x-2">
		<Toggle
			onPressedChange={() => {
				document.getElementById('google-maps')?.classList.toggle('hidden');
			}}
			variant="outline"
			class="z-10 h-14 w-14 bg-map bg-[length:90%] bg-center bg-no-repeat mouse:hidden"
		></Toggle>
		<ResetViewButton
			{streetView}
			origin={$map!.places[round]}
			class="z-10 h-14 w-14 bg-flag bg-[length:90%] bg-center bg-no-repeat"
		></ResetViewButton>
		{#if $user?.isAdmin}
		<Button
		class="z-10 h-14 w-14 bg-[length:100%] bg-center bg-no-repeat"
			onclick={async () => {
				await prepareUsersForRound();
				const response = await fetch('/time');
				const string_time = await response.json();
				const time = new Date(string_time);
				await pb.collection('game').update($game ? $game?.id : '', {
					round: $game?.round + 1,
					roundStart: time.toJSON()
				});
			}}>Next</Button>
		{/if}
	</div>
	<div
		id="google-maps"
		class={'z-10 hidden rounded-lg border-[3px] border-black transition-all mouse:block ' +
			'h-[70%] w-[95%] opacity-100 mouse:h-[40%] mouse:w-[25%] mouse:opacity-40 mouse:hover:h-[70%] mouse:hover:w-[50%] mouse:hover:opacity-100'}
	></div>
</div>

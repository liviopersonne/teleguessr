<script lang="ts">
	import UserRound from 'lucide-svelte/icons/user-round';
	import Check from 'lucide-svelte/icons/check';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { onDestroy, onMount } from 'svelte';
	import { pb } from '$lib/pocketbase';
	import { user } from '$lib/auth/auth';
	import { game, resetUsers } from '$lib/game/game';
	import type { RecordModel } from 'pocketbase';

	let players: RecordModel[] = [];
	let unsubscribeGame: () => void;

	async function getPlayers() {
		return (
			await pb.collection('game').getOne($game!.id, {
				expand: 'user_via_game',
				fields: 'expand'
			})
		).expand?.user_via_game;
	}
	onMount(async () => {
		unsubscribeGame = game.subscribe(async () => {
			players = await getPlayers();
		});
		players = await getPlayers();
	});
	onDestroy(() => {
		if (typeof unsubscribeGame === 'function') unsubscribeGame();
	});
</script>

<Card.Root class="w-full">
	<Card.Header>
		<Card.Title>Lobby</Card.Title>
		<Card.Description>Vous êtes dans un lobby, attendez que la partie se lance</Card.Description>
	</Card.Header>
	<Card.Content class="grid gap-4">
		<div class=" flex items-center space-x-4 rounded-md border p-4">
			<UserRound />
			<div class="flex-1 space-y-1">
				<p class="text-sm font-medium leading-none">Participants ({players.length})</p>
			</div>
		</div>
		<div>
			{#each players as player}
				<div class="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
					<span class="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500"></span>
					<div class="space-y-1">
						<p class="text-sm font-medium leading-none">
							{player.username}
						</p>
					</div>
				</div>
			{/each}
		</div>
	</Card.Content>
	<Card.Footer class="flex flex-col gap-2">
		{#if $user?.isAdmin}
			<Button
				onclick={async () => {
					await resetUsers();
					pb.collection('game').update($game ? $game.id : '', {
						inProgress: 'true',
						roundStart: new Date().toJSON()
					});
				}}
				class="w-full"
			>
				<Check class="mr-2 h-4 w-4" /> Lancer la partie
			</Button>
		{/if}
		<Button
			onclick={() => {
				pb.collection('user').update($user ? $user.id : '', { game: '' });
			}}
			class="w-full"
		>
			<Check class="mr-2 h-4 w-4" /> Quitter la partie
		</Button>
	</Card.Footer>
</Card.Root>

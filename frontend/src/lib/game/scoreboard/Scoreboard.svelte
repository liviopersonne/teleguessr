<script lang="ts">
	import ScoreSortButton from '$lib/game/scoreboard/ScoreSortButton.svelte';
	import {
		type ColumnDef,
		getCoreRowModel,
		getSortedRowModel,
		type SortingState
	} from '@tanstack/table-core';
	import * as Table from '$lib/components/ui/table/index.js';
	import {
		createSvelteTable,
		FlexRender,
		renderComponent
	} from '$lib/components/ui/data-table/index.js';
	import { onMount } from 'svelte';
	import { game } from '$lib/game/game';
	import { pb } from '$lib/pocketbase';
	import type { RecordModel } from 'pocketbase';
	import { Button } from '$lib/components/ui/button';
	import { user } from '$lib/auth/auth';
	import { computeTotalScore } from '../result/result';

	onMount(async () => {
		data = (
			await pb.collection('game').getOne($game!.id, {
				expand: 'user_via_game',
				fields: 'expand'
			})
		).expand?.user_via_game;
		for (const user of data) {
			user.total = computeTotalScore(user);
		}
	});

	let { round }: { round: number } = $props();

	let columns: ColumnDef<RecordModel>[] = [
		{
			accessorKey: 'username',
			header: 'Username'
		}
	];
	columns.push({
		accessorKey: 'total',
		header: ({ column }) =>
			renderComponent(ScoreSortButton, {
				name: 'Score total',
				onclick: () => column.toggleSorting(column.getIsSorted() === 'asc')
			})
	});
	for (let i = 0; i < round; i++) {
		columns.push({
			accessorKey: `score.${i}`,
			header: ({ column }) =>
				renderComponent(ScoreSortButton, {
					name: `Round ${i + 1}`,
					onclick: () => column.toggleSorting(column.getIsSorted() === 'asc')
				})
		});
	}

	let data: RecordModel[] = $state([]);

	let sorting = $state<SortingState>([]);
	let table = createSvelteTable({
		get data() {
			return data;
		},
		columns: columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
		},
		state: {
			get sorting() {
				return sorting;
			}
		}
	});

	function downloadCSV() {
	    const headers = ['Username', 'Score total', ...Array.from({ length: round }, (_, i) => `Round ${i + 1}`)];
	    const rows = data.map(user => [
	        user.username,
	        user.total,
	        ...Array.from({ length: round }, (_, i) => user.score?.[i] ?? '')
	    ]);

	    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
	    const blob = new Blob([csv], { type: 'text/csv' });
	    const url = URL.createObjectURL(blob);
	    const a = document.createElement('a');
	    a.href = url;
	    a.download = 'scoreboard.csv';
	    a.click();
	    URL.revokeObjectURL(url);
	}
</script>

<Button variant="outline" onclick={downloadCSV}>
    Telecharger les resultats
</Button>
<Button
	variant="outline"
	onclick={() => {
		pb.collection('user').update($user ? $user.id : '', {
			game: ''
		});
	}}
>
	Quitter la partie
</Button>
<div class="rounded-md border">
	<Table.Root>
		<Table.Header>
			{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<Table.Row>
					{#each headerGroup.headers as header (header.id)}
						<Table.Head>
							{#if !header.isPlaceholder}
								<FlexRender
									content={header.column.columnDef.header}
									context={header.getContext()}
								/>
							{/if}
						</Table.Head>
					{/each}
				</Table.Row>
			{/each}
		</Table.Header>
		<Table.Body>
			{#each table.getRowModel().rows as row (row.id)}
				<Table.Row data-state={row.getIsSelected() && 'selected'}>
					{#each row.getVisibleCells() as cell (cell.id)}
						<Table.Cell>
							<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
						</Table.Cell>
					{/each}
				</Table.Row>
			{:else}
				<Table.Row>
					<Table.Cell colspan={columns.length} class="h-24 text-center">No results.</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>

<template>
	<v-dialog :model-value="currentRendszeruzenet !== undefined">
		<v-card>
			<v-card-title>{{ currentRendszeruzenet?.targy }}</v-card-title>
			<v-card-text>
				{{ currentRendszeruzenet?.uzenet }}
			</v-card-text>
			<v-card-actions>
				<v-button :loading="approving" @click="approve(currentRendszeruzenet?.id as number)">
					{{ currentRendszeruzenet?.gomb_szoveg || 'OK' }}
				</v-button>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script lang="ts">
import { getToken } from '@/api';
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import _ from 'lodash';
import { refresh } from '../auth';

type RendszeruzenetItem = {
	id: number;
	targy: string;
	uzenet: string;
	gomb_szoveg: string;
	gomb_link: string;
};

const getBackendHost = () => {
	const { host, port } = window.location;

	if (port) {
		// localhost
		// port is specified
		// possible host: localhost:3030, 127.0.0.1:3030
		return host.replace('3030', '8055');
	} else if (host.includes('3030')) {
		// Probably GitPod
		// port is included into the subdomain
		// Expected host: 3030-qdiak-quantumugyvitel-zx4yhwwh20o.ws-us101.gitpod.io
		return host.replace('3030', '8055');
	} else {
		// Production
		// No port specified
		// Expected host: cloud.qdiak.hu
		// TODO how to determine the backend hostname?
		return null;
	}
};

export default defineComponent({
	setup() {
		const router = useRouter();
		const backendHost = getBackendHost();

		if (!backendHost) {
			console.error('Unable to determine backend host');
			return;
		}

		const url = `ws://${backendHost}/websocket`;
		let delayPending = false;
		let connection: WebSocket | null;
		let queue: RendszeruzenetItem[] = [];
		let currentRendszeruzenet = ref<RendszeruzenetItem | undefined>(undefined);
		let markAsRead: (id: number) => void;
		let approving = false;

		const showNext = (delay: boolean) => {
			setTimeout(
				() => {
					currentRendszeruzenet.value = queue.shift();
				},
				delay ? 500 : 0
			);
		};

		const approve = (id: number) => {
			markAsRead(id);
		};

		function restart(delay = 0) {
			if (delayPending) {
				// Újraindítás már elindult, ebben a fázisban nem reseteljük ismét, különben több connection indulhat.
				return;
			}
			console.log(`Restart socket in ${delay}ms`);

			connection = null;
			delayPending = true;

			setTimeout(start, delay);
		}

		async function start() {
			delayPending = false;
			const access_token = getToken() || (await refresh());

			if (!access_token) {
				console.log('User is not logged in');

				restart(5000);
				return;
			}

			console.log('Create new socket');
			connection = new WebSocket(url);

			markAsRead = (id: number) => {
				console.log('Delete item', id);
				approving = true;

				connection?.send(
					JSON.stringify({
						type: 'items',
						collection: 'rendszeruzenet',
						action: 'delete',
						id,
					})
				);

				const link = currentRendszeruzenet.value?.gomb_link;

				if (link && link.length) {
					router.push(link);
				}
			};

			connection?.addEventListener('open', function () {
				console.log('Socket open, authenticate');

				connection?.send(
					JSON.stringify({
						type: 'auth',
						access_token,
					})
				);
			});

			connection?.addEventListener('message', function (message) {
				const data = JSON.parse(message.data);

				if (data.type === 'auth') {
					if (data.status === 'ok') {
						console.log('Authenticated, subscribe');

						connection?.send(
							JSON.stringify({
								type: 'subscribe',
								collection: 'rendszeruzenet',
								query: {
									fields: ['id', 'uzenet', 'targy', 'gomb_szoveg', 'gomb_link'],
									filter: {
										_created_by_me: true,
									},
									limit: -1,
								},
							})
						);
					} else {
						console.log('Socket auth failed');

						restart(10000);
					}
				}

				if (data.type === 'subscription') {
					if (data.event === 'init') {
						console.log('Subscribed');
					}

					if (data.event === 'delete') {
						console.log('Items deleted', data.data);

						// Hide if the current was deleted
						if (data.data.find((id: number) => id === currentRendszeruzenet.value?.id)) {
							currentRendszeruzenet.value = undefined;
							approving = false;
						}

						// Remove all deleted messages from the queue
						queue = queue.filter((r) => !data.data.includes(r.id));

						if (!currentRendszeruzenet.value) {
							showNext(true);
						}
					} else if (data.event === 'init' || data.event === 'create') {
						if (data.data.length) {
							console.log('Items received', data.data);

							queue = queue.concat(data.data);

							if (!currentRendszeruzenet.value) {
								showNext(false);
							}
						}
					}
				}
			});

			connection?.addEventListener('close', function () {
				console.log('Socket closed');

				restart(5000);
			});

			connection?.addEventListener('error', function (error) {
				console.error(error);
				console.log('Socket error');

				restart(30000);
			});
		}

		// Wait until the authentication completes on the client
		delayPending = true;
		setTimeout(start, 500);

		return {
			currentRendszeruzenet,
			approve,
			approving,
		};
	},
});
</script>

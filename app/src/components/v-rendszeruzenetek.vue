<template>
	<v-dialog :model-value="currentRendszeruzenet !== null">
		<v-card>
			<v-card-title>{{ currentRendszeruzenet?.targy }}</v-card-title>
			<v-card-text>
				{{ currentRendszeruzenet?.uzenet }}
			</v-card-text>
			<v-card-actions>
				<v-button :loading="approving" @click="approve()">
					{{ currentRendszeruzenet?.gomb_szoveg }}
				</v-button>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script lang="ts">
import api from '@/api';
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/stores/app';
import _ from 'lodash';
import { AxiosResponse } from 'axios';
import { refresh } from '../auth';

export default defineComponent({
	setup() {
		const appStore = useAppStore();
		const router = useRouter();

		type RendszeruzenetItem = {
			id: number;
			targy: string;
			uzenet: string;
			tipus: string;
			gomb_szoveg: string;
			gomb_link: string;
		};

		type RendszeruzenetResponse = {
			data: {
				longPolling: boolean;
				items: RendszeruzenetItem[];
			};
		};

		_.set(window, '_test_rendszeruzenet', async (msg: string) => {
			await api.post('/items/rendszeruzenet', {
				targy: 'Teszt',
				uzenet: msg,
				tipus: 'info',
				gomb_szoveg: 'OK',
				gomb_link: '/admin/content/dolgozo',
				olvasott: false,
			});
		});

		function sleep(ms: number) {
			return new Promise((resolve) => setTimeout(resolve, ms));
		}

		const POLL_TIMEOUT = 2000;
		let longPollingDisabled = false;
		let errorCount = 0;
		let currentRendszeruzenet = ref<RendszeruzenetItem | null>(null);
		let approving = ref<boolean | null>(false);

		async function checkMessages() {
			try {
				if (appStore.authenticated && !currentRendszeruzenet.value) {
					// console.log('poll...');
					const result = (await api.get<any, AxiosResponse<RendszeruzenetResponse>>('/rendszeruzenet')).data.data;
					if (result.longPolling === false) {
						longPollingDisabled = true;
					}
					if (result.items.length) {
						currentRendszeruzenet.value = result.items[0]; // TODO return only one!
					}
				} else {
					// wait...
					// console.log('wait...');
				}
				errorCount = 0;
			} catch (err) {
				if (_.get(err, 'response.status') === 401) {
					try {
						await refresh();
					} catch (refreshErr) {
						// console.error(refreshErr);
					}
				}
				errorCount++;
				// console.error(err);
			}
			await sleep(POLL_TIMEOUT);
			if (!longPollingDisabled && errorCount < 5) {
				void checkMessages();
			}
		}
		void checkMessages();

		async function approve() {
			if (approving.value) {
				return;
			}
			// console.debug('approve...');
			try {
				approving.value = true;
				await api.patch('/items/rendszeruzenet/' + currentRendszeruzenet.value?.id, { olvasott: true });
				if (currentRendszeruzenet.value?.gomb_link) {
					router.push(currentRendszeruzenet.value.gomb_link);
				}
			} catch (err) {
				// console.error(err);
			}
			// close the dialogue
			// the message will come up again anyway if the update is not successful
			currentRendszeruzenet.value = null;
			approving.value = false;
		}

		return {
			currentRendszeruzenet,
			approve,
			approving,
		};
	},
});
</script>

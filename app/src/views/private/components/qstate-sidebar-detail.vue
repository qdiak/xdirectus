<template>
	<sidebar-detail v-if="statesStore.primaryActions.length + statesStore.secondaryActions.length > 0" icon="bolt" title="Műveletek">
		<div class="fields">
			<div v-for="primaryAction in statesStore.primaryActions" :key="primaryAction.id" class="field full">
				<v-button
					small
					full-width
					:loading="runningActions.includes(primaryAction.id)"
					@click="onActionClick(primaryAction)"
				>
					{{ primaryAction.btn_text }}
				</v-button>
			</div>
			<div v-for="secondaryAction in statesStore.secondaryActions" :key="secondaryAction.id" class="field full">
				<v-button
					small
					full-width
					secondary
					:loading="runningActions.includes(secondaryAction.id)"
					@click="onActionClick(secondaryAction)"
				>
					{{ secondaryAction.btn_text }}
				</v-button>
			</div>
		</div>

		<v-dialog :model-value="!!confirmRunAction" @esc="resetConfirm">
			<v-card>
				<v-card-title>{{ confirmRunAction?.btn_text }}</v-card-title>
				<v-card-text>{{ confirmRunAction?.popup_msg }}</v-card-text>

				<v-card-actions>
					<v-button secondary @click="resetConfirm">
						{{ t('cancel') }}
					</v-button>
					<v-button @click="runAction(confirmRunAction!)">
						{{ t('continue_label') }}
					</v-button>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</sidebar-detail>
</template>

<script setup lang="ts">
import api from '@/api';
import { useStatesStore, Action } from '@/stores/states';
import { notify } from '@/utils/notify';
import { unexpectedError } from '@/utils/unexpected-error';
import { ref, toRefs, watch, onMounted, toRaw } from 'vue';
import { useI18n } from 'vue-i18n';

interface Props {
	collection: string;
	primaryKey?: string | number;
	selection?: (number | string)[];
	location: 'collection' | 'item';
	hasEdits?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	primaryKey: undefined,
	selection: () => [],
	hasEdits: false,
});

const emit = defineEmits(['refresh']);

const { t } = useI18n();

const { collection, primaryKey, selection } = toRefs(props);

const statesStore = useStatesStore();


onMounted(async () => {
	watch(
		[primaryKey, () => selection.value],
		() => {
			const ids = toRaw(primaryKey.value ? [primaryKey.value] : selection.value)
			statesStore.hydrate(collection.value, ids)
		},
		{ immediate: true }
	);
});

const runningActions = ref<string[]>([]);
const confirmRunAction = ref<Action | null>(null);
const confirmValues = ref<Record<string, any> | null>();

const resetConfirm = () => {
	confirmRunAction.value = null;
	confirmValues.value = null;
};

const onActionClick = async (action: Action) => {
	if (action.confirm_popup) {
		confirmRunAction.value = action;
	} else {
		runAction(action)
	}
};

const runAction = async (action: Action) => {
	confirmRunAction.value = null;

	runningActions.value = [...runningActions.value, action.id];

	try {
		await api.post('/quantum_process/stateTransition/run', {
			input: {
				actionType: action.type,
				collection: collection.value,
				ids: toRaw(primaryKey.value ? [primaryKey.value] : selection.value)
			}
		});

		emit('refresh');

		notify({
			title: 'Sikeres művelet',
		});

		resetConfirm();
	} catch (err: any) {
		unexpectedError(err);
	} finally {
		runningActions.value = runningActions.value.filter((runningAction) => runningAction !== action.id);
	}
};
</script>

<style lang="scss" scoped>
@import '@/styles/mixins/form-grid';

.fields {
	@include form-grid;
}

.fields {
	--form-vertical-gap: 24px;

	.type-label {
		font-size: 1rem;
	}
}

:deep(.v-button) .button:disabled {
	--v-button-background-color-disabled: var(--background-normal-alt);
}

.v-icon {
	margin-right: 8px;
}

.confirm-form {
	--form-horizontal-gap: 24px;
	--form-vertical-gap: 24px;

	margin-top: var(--v-card-padding);

	:deep(.type-label) {
		font-size: 1rem;
	}
}
</style>

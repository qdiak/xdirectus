import { usePermissionsStore } from '@/stores/permissions';
import { useUserStore } from '@/stores/user';
import { fetchAll } from '@/utils/fetch-all';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export type Action = {
	btn_style: string
	btn_text: string
	confirm_popup: boolean
	id: string
	popup_msg: string
	type: string
}

export const useStatesStore = defineStore('statesStore', () => {
	const primaryActions = ref<Action[]>([]);
	const secondaryActions = ref<Action[]>([]);

	return {
		primaryActions,
		secondaryActions,
		hydrate,
		dehydrate,
	};

	async function hydrate(collection: string, ids: (number | string)[]) {
		primaryActions.value = [];
		secondaryActions.value = [];

		if (!ids.length)  {
			return
		}

		const { isAdmin, currentUser } = useUserStore();
		const { hasPermission } = usePermissionsStore();

		if (isAdmin !== true && !hasPermission('states', 'read')) {
			return
		} else {
			try {
				const items = await fetchAll(`/items/${collection}`, {
					params: {
						fields: [
							'id',
							'state',
							'state.id',
							'state.primary_actions.action_id',
							'state.primary_actions.role',
							'state.secondary_actions.action_id',
							'state.secondary_actions.role',
							'state.can_edit.directus_roles_id',
						],
						filter: {
							id: {_in: ids}
						}
					 },
				}) as any[];

				if (!items.length || !items[0].state) {
					return
				}

				// Az összes kijelölt azonos state-ben van?
				if (!items.every(i => i.state?.id === items[0].state?.id)) {
					return
				}

				const primaryActionIds: number[] = []
				const secondaryActionIds: number[] = []

				for (const item of items) {
					const authorized = isAdmin || item.state.can_edit.map((can_edit: any) => can_edit.directus_roles_id).includes(currentUser?.role?.id)

					if (authorized) {
						for (const primaryKapcsolo of item.state.primary_actions) {
							const authorized = isAdmin || primaryKapcsolo.role === currentUser?.role?.id

							if (authorized) {
								primaryActionIds.push(primaryKapcsolo.action_id)
							}

						}

						for (const secondaryKapcsolo of item.state.secondary_actions) {
							const authorized = isAdmin || secondaryKapcsolo.role === currentUser?.role?.id

							if (authorized && !primaryActionIds.includes(secondaryKapcsolo.action_id)) {
								secondaryActionIds.push(secondaryKapcsolo.action_id)
							}
						}
					}
				}

				const actions = await fetchAll('/items/action', {
					params: {
						fields: [
							'id',
							'type',
							'btn_text',
							'btn_style',
							'confirm_popup',
							'popup_msg',
						],
						filter: {
							_and: [
							  {
								_or: [
								  {
									id: {
									  _in: primaryActionIds,
									},
								  },
								  {
									id: {
									  _in: secondaryActionIds,
									},
								  },
								],
							  },
							],
						  },
					 },
				}) as Action[];

				primaryActions.value = actions
					.filter((a: any) => primaryActionIds.includes(a.id))

				secondaryActions.value = actions
					.filter((a: any) => secondaryActionIds.includes(a.id))

			} catch {
				primaryActions.value = [];
				secondaryActions.value = [];
			}
		}
	}

	async function dehydrate() {
		primaryActions.value = [];
		secondaryActions.value = [];
	}
});

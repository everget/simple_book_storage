import { Model } from './model';
import { View } from './view';

export const Controller = {
	init() {
		if (!Controller.isLocalStorageSupported()) {
			// eslint-disable-next-line no-alert
			alert('Sorry, localStorage is not supported by your browser!');
		}

		View.init({
			onAddItemCallback: Controller.onAddItemCallback,
			onRemoveItemCallback: Controller.onRemoveItemCallback,
			onEditItemCallback: Controller.onEditItemCallback,
		});

		// View рендерит все полученные из Model данные
		View.renderItems(Model.getAllItems());
	},

	onAddItemCallback(...args) {
		Controller.addItem(...args);
	},

	onRemoveItemCallback(...args) {
		Controller.removeItem(...args);
	},

	onEditItemCallback(...args) {
		Controller.editItem(...args);
	},

	addItem(itemData) {
		if (View.isEditingState()) {
			Model.saveItem(itemData);
			View.updateItem(itemData);
		} else {
			const newItem = Model.create(itemData); // Новая книжечка
			Model.saveItem(newItem);
			View.renderItem(newItem);
		}
		View.setState({ mode: View.MODES.DEFAULT, editedItemId: null });
	},

	editItem(itemId) {
		View.setState({ mode: View.MODES.EDITING, editedItemId: itemId });
		View.scrollToTop();
		View.fillInputs(Model.getItem(itemId));
	},

	removeItem(itemId) {
		Model.removeItem(itemId, () => {
			View.removeItem(itemId);
			View.setState({ mode: View.MODES.DEFAULT, editedItemId: null });
		});
	},

	isLocalStorageSupported() {
		// https://github.com/Modernizr/Modernizr/blob/master/feature-detects/storage/localstorage.js
		const mod = 'modernizr';
		try {
			localStorage.setItem(mod, mod);
			localStorage.removeItem(mod);
			return true;
		} catch (e) {
			return false;
		}
	},
};

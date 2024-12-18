export const Model = {
	prefix: 'bookapp-',

	has(key) {
		return !!localStorage.getItem(Model.prefix + String(key));
	},

	generateHash(string) {
		const base = [
			...'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
			...'abcdefghijklmnopqrstuvwxyz',
			...'0123456789',
			...string,
		];
		// eslint-disable-next-line no-unused-vars
		return [...Array(16)].map((_) => base[(Math.random() * base.length) | 0]).join('');
	},

	create({ author, name, year, pages }) {
		const newItem = {
			id: Model.generateHash(name),
			author: Model.escapeString(author),
			name: Model.escapeString(name),
			year: Model.escapeString(year),
			pages: Model.escapeString(pages),
		};
		return newItem;
	},

	getItem(key) {
		return Model.parseJSON(localStorage.getItem(Model.prefix + String(key)));
	},

	getAllItems() {
		const availableItems = [];
		let i = localStorage.length;
		while (i--) {
			const key = localStorage.key(i);
			if (key.startsWith(Model.prefix)) {
				availableItems.push(Model.parseJSON(localStorage.getItem(key)));
			}
		}
		return availableItems;
	},

	saveItem(item, callback) {
		const itemKey = Model.prefix + item.id;

		try {
			localStorage.setItem(itemKey, Model.toJSON(item));

			if (typeof callback === 'function') {
				callback();
			}
		} catch (e) {
			const reQuota = /quota/i;
			if (
				e.toString().indexOf('QuotaExceededError') !== -1 ||
				e.toString().indexOf('QUOTA_EXCEEDED_ERR') !== -1 ||
				reQuota.test(e.name) ||
				reQuota.test(e.message)
			) {
				// eslint-disable-next-line no-alert
				alert('The localStorage is full');
			}
		}
	},

	removeItem(key, callback) {
		localStorage.removeItem(Model.prefix + key);

		if (typeof callback === 'function') {
			callback();
		}
	},

	size() {
		return localStorage.length;
	},

	clear() {
		localStorage.clear();
	},

	toJSON(item) {
		return JSON.stringify(item);
	},

	parseJSON(value) {
		try {
			return JSON.parse(value);
		} catch (e) {
			return String(value);
		}
	},

	escapeString(string) {
		const value = string == null ? '' : `${string}`;
		const escapes = {
			'<': '&lt;',
			'>': '&gt;',
			'&': '&amp;',
			"'": '&quot;',
			'"': '&#x27;',
			'`': '&#x60;',
		};
		return value.replace(/[<>&"'`]/g, (match) => escapes[match]);
	},
};

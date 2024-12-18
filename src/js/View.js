const MODES = {
	DEFAULT: 'default',
	EDITING: 'editing',
};

export const View = {
	$body: null,
	$form: null,
	$inputs: null,
	$author: null,
	$name: null,
	$year: null,

	$pages: null,
	$table: null,

	$addButton: null,

	MODES,
	state: {
		mode: MODES.DEFAULT,
		editedItemId: null,
	},
	props: {},

	init({
		onInputCallback,
		onAddItemCallback,
		onRemoveItemCallback,
		onEditItemCallback,
	}) {
		View.$body = $('html, body');
		View.$inputs = $('[data-js-selector^="form-input-"]');
		View.$author = $('[data-js-selector="form-input-author"]');
		View.$name = $('[data-js-selector="form-input-name"]');
		View.$year = $('[data-js-selector="form-input-year"]');
		View.$pages = $('[data-js-selector="form-input-pages"]');
		View.$table = $('[data-js-selector="table-body"]');
		View.$addButton = $('[data-js-selector="add-button"]');

		// Маски для инпутов года и количества страниц
		View.$year.mask('9?999', {
			placeholder: '_',
			completed: function cb() {
				this.trigger('input');
			},
		});

		View.$pages.mask('9?99', {
			placeholder: '_',
			completed: function cb() {
				this.trigger('input');
			},
		});

		Object.assign(View.props, {
			onInputCallback,
			onAddItemCallback,
			onRemoveItemCallback,
			onEditItemCallback,
		});

		// Короче, когда юзер заполнит инпуты,
		// Controller скажет View убрать атрибут 'disabled' у кнопки 'Add new book' / 'Save changes'
		View.$inputs.on('input', View.onInputHandler);

		// Обработка клика по 'Add new book' / 'Save changes'
		View.$addButton.on('click', View.onAddItemHandler);

		// Обработка клика по кнопке 'Edit'
		View.$table.on('click', '[data-js-selector="edit-button"]', View.onEditItemHandler);

		// Обработка клика по кнопке 'Remove'
		View.$table.on('click', '[data-js-selector="remove-button"]', View.onRemoveItemHandler);
	},

	isEditingState() {
		return View.state.mode === View.MODES.EDITING;
	},

	setState(newState) {
		Object.assign(View.state, newState);
		if (newState.mode === View.MODES.EDITING) {
			View.$addButton.text('Save changes').removeAttr('disabled');
		} else {
			View.$addButton.text('Add new book').attr('disabled', 'disabled');
			View.clearInputs(); // Чистка инпутов
		}
	},

	onInputHandler(/* event */) {
		if (!View.hasEmptyInputs()) {
			View.$addButton.removeAttr('disabled');
		}

		if (View.props.onInputCallback === 'function') {
			View.props.onInputCallback();
		}
	},

	onAddItemHandler(/* event */) {
		if (View.hasEmptyInputs()) {
			return;
		}

		if (typeof View.props.onAddItemCallback === 'function') {
			View.props.onAddItemCallback({
				id: View.state.editedItemId,
				...View.getInputValues(),
			});
		}
	},

	onRemoveItemHandler(event) {
		if (typeof View.props.onRemoveItemCallback === 'function') {
			const itemId = $(event.target)
				.closest('[data-js-selector="item-row"]')
				.data('js-item-id');
			View.props.onRemoveItemCallback(itemId);
		}
	},

	onEditItemHandler(event) {
		const itemId = $(event.target).closest('[data-js-selector="item-row"]').data('js-item-id');
		if (typeof View.props.onEditItemCallback === 'function') {
			View.props.onEditItemCallback(itemId);
		}
	},

	fillInputs({ author = '', name = '', year = '', pages = '' } = {}) {
		View.$author.val(author);
		View.$name.val(name);
		View.$year.val(year);
		View.$pages.val(pages);
	},

	clearInputs() {
		View.fillInputs();
	},

	getInputValues() {
		return {
			author: View.$author.val(),
			name: View.$name.val(),
			year: View.$year.val(),
			pages: View.$pages.val(),
		};
	},

	hasEmptyInputs() {
		return !View.$author.val() || !View.$name.val() || !View.$year.val() || !View.$pages.val();
	},

	compileRowTemplate: ({ id, author, name }) => `
		<tr class="table-row" data-js-selector="item-row" data-js-item-id="${id}">
			<td data-js-item-author="${author}"><div>${author}</div></td>
			<td data-js-item-name="${name}"><div>${name}</div></td>
			<td>
				<button type="button" data-js-selector="edit-button" class="btn btn-primary edit-button">
					<span class="hidden-xs">Edit</span>
					<span class="glyphicon glyphicon-pencil visible-xs"></span>
				</button>
				<button type="button" data-js-selector="remove-button" class="btn btn-danger remove-button">
					<span class="hidden-xs">Remove</span>
					<span class="glyphicon glyphicon-trash visible-xs"></span>
				</button>
			</td>
		</tr>
	`,

	updateItem(item) {
		View.$table
			.find(`[data-js-item-id="${item.id}"]`)
			.children()
			.filter('[data-js-item-author]')
			.data('js-item-author', item.author)
			.text(item.author)
			.end()
			.filter('[data-js-item-name]')
			.data('js-item-name', item.name)
			.text(item.name);
	},

	renderItem(item) {
		View.$table.append(View.compileRowTemplate(item)).children().last().fadeIn('fast');
	},

	renderItems(items) {
		if (items.length === 0) {
			return;
		}

		let i = 0;
		const animationId = setInterval(() => {
			if (i < items.length) {
				View.$table
					.append(View.compileRowTemplate(items[i]))
					.children('tr')
					.eq(i)
					.fadeIn('fast');
				View.scrollToBottom();
				i++;
			} else {
				clearInterval(animationId);
				i = 0;
			}
		}, 300);
	},

	removeItem(itemId) {
		const row = View.$table.find(`[data-js-item-id=${itemId}]`);

		// Удаляемая строка красиво пропадает из таблицы
		row.css({ height: row.height() })
			.animate({ opacity: 0 }, 300)
			.children()
			.hide()
			.end()
			.animate({ height: '0px' }, 200);

		// Надо подождать пока завершатся анимации,
		// а после удалить строку из DOM (а значит и из таблицы)
		setTimeout(() => {
			row.remove();
		}, 600);
	},

	scrollTo(position, duration) {
		View.$body.animate(
			{
				scrollTop: position,
			},
			duration
		);
	},

	scrollToBottom() {
		scrollTo($(document).height() - $(window).height(), 300);
	},

	scrollToTop() {
		scrollTo(0, 600);
	},
};
